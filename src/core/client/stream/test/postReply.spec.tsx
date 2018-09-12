import { ReactTestRenderer } from "react-test-renderer";
import timekeeper from "timekeeper";

import { timeout } from "talk-common/utils";
import { createSinonStub } from "talk-framework/testHelpers";

import create from "./create";
import { assets, users } from "./fixtures";

let testRenderer: ReactTestRenderer;
beforeEach(() => {
  const resolvers = {
    Query: {
      asset: createSinonStub(
        s => s.throws(),
        s => s.withArgs(undefined, { id: assets[0].id }).returns(assets[0])
      ),
      me: createSinonStub(
        s => s.throws(),
        s => s.withArgs(undefined, { clientAuthRevision: 0 }).returns(users[0])
      ),
    },
    Mutation: {
      createComment: createSinonStub(
        s => s.throws(),
        s =>
          s
            .withArgs(undefined, {
              input: {
                assetID: assets[0].id,
                parentID: assets[0].comments.edges[0].node.id,
                body: "<strong>Hello world!</strong>",
                clientMutationId: "0",
              },
            })
            .returns({
              edge: {
                cursor: null,
                node: {
                  id: "comment-x",
                  author: users[0],
                  body: "<strong>Hello world! (from server)</strong>",
                  createdAt: "2018-07-06T18:24:00.000Z",
                  replies: {
                    edges: [],
                    pageInfo: { endCursor: null, hasNextPage: false },
                  },
                  editing: {
                    edited: false,
                    editableUntil: "2018-07-06T18:24:30.000Z",
                  },
                },
              },
              clientMutationId: "0",
            })
      ),
    },
  };

  ({ testRenderer } = create({
    // Set this to true, to see graphql responses.
    logNetwork: false,
    resolvers,
    initLocalState: localRecord => {
      localRecord.setValue(assets[0].id, "assetID");
    },
  }));
});

it("renders comment stream", async () => {
  // Wait for loading.
  await timeout();
  expect(testRenderer.toJSON()).toMatchSnapshot();
});

it("post a reply", async () => {
  // Wait for loading.
  await timeout();

  // Open reply form.
  testRenderer.root
    .findByProps({ id: "comments-commentContainer-replyButton-comment-0" })
    .props.onClick();

  await timeout();
  expect(testRenderer.toJSON()).toMatchSnapshot("open reply form");

  // Write reply .
  testRenderer.root
    .findByProps({ inputId: "comments-replyCommentForm-rte-comment-0" })
    .props.onChange({ html: "<strong>Hello world!</strong>" });

  timekeeper.freeze(new Date("2018-07-06T18:24:00.000Z"));
  testRenderer.root
    .findByProps({ id: "comments-replyCommentForm-form-comment-0" })
    .props.onSubmit();
  // Test optimistic response.
  expect(testRenderer.toJSON()).toMatchSnapshot("optimistic response");
  timekeeper.reset();

  // Wait for loading.
  await timeout();

  // Test after server response.
  expect(testRenderer.toJSON()).toMatchSnapshot("server response");
});