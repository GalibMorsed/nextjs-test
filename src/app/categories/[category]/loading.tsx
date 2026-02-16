import LoadingState from "../../components/loadingState";

export default function LoadingCategoryPage() {
  return (
    <LoadingState
      title="Fetching category headlines"
      description="Please hang tight while we collect the freshest stories for this category."
      emoji="📰"
    />
  );
}
