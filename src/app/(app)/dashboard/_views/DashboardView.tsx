import DashboardCommunitySection from '../_components/DashboardCommunitySection';
import DashboardGreetingSection from '../_components/DashboardGreeting';
import DashboardProblemSets from '../_components/DashboardProblemSets';
import DashboardUpcomingEvents from '../_components/DashboardUpcomingEvents';

export default function DashboardView() {
  return (
    <div className="h-dvh overflow-y-auto bg-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="mx-auto flex max-w-[1040px] flex-col gap-4 px-10 py-10">
        <DashboardGreetingSection />
        <DashboardUpcomingEvents />
        <DashboardProblemSets />
        <DashboardCommunitySection />
      </div>
    </div>
  );
}
