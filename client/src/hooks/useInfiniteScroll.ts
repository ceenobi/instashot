import useInfiniteScroll from "react-infinite-scroll-hook";

export default function useInfiniteScrollBox({
  loading,
  hasNextPage,
  loadMore,
  error,
}: {
  loading: boolean;
  hasNextPage: boolean;
  loadMore: () => void;
  error: unknown;
}) {
  const [infiniteRef] = useInfiniteScroll({
    loading,
    hasNextPage,
    onLoadMore: loadMore,
    disabled: Boolean(error),
    rootMargin: "0px 0px 400px 0px",
  });
  return { infiniteRef };
}
