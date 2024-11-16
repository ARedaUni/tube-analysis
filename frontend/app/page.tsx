import Image from "next/image";
import RepositoryOverviewCard from "./comps/pageoverview";

export default function Home() {
  return (
    <RepositoryOverviewCard
  name="example-repo"
  owner="example-owner"
  stars={1000}
  forks={250}
  openIssuesCount={50}
  closedIssuesCount={200}
  mergedPrCount={150}
  unmergedPrCount={20}
  positiveCommentPercentage={65.5}
  negativeCommentPercentage={10.2}
  neutralCommentPercentage={24.3}
  starHistory={[
    { date: '2023-01-01', stars: 800 },
    { date: '2023-02-01', stars: 850 },
    { date: '2023-03-01', stars: 900 },
    { date: '2023-04-01', stars: 950 },
    { date: '2023-05-01', stars: 1000 },
  ]}
/>
  );
}
