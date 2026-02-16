import LoadingState from "../components/loadingState";

export default function ApiSegmentLoading() {
  return (
    <LoadingState
      title="Syncing latest updates"
      description="Our services are preparing fresh data for you right now. Thanks for your patience."
      emoji="⚡"
    />
  );
}
