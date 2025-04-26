import Pusher from "pusher-js";

const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP, {
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
});

const storyChannel = pusher.subscribe("story-channel");
storyChannel.bind("like-story", function (data: unknown) {
  console.log("New story like:", data);
});
storyChannel.bind("story-viewed", function (data: unknown) {
  console.log("New story view:", data);
});

const postChannel = pusher.subscribe("post-channel");
postChannel.bind("like-post", function (data: unknown) {
  console.log("New post like:", data);
});

export default pusher;
