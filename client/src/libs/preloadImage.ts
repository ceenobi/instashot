const preloadImage = (image: string) => {
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = image;
  document.head.appendChild(link);
};

export default preloadImage;
