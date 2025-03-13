import ProfileHeader from "@/components/shared/ProfileHeader";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { getUnreadNotificationsCount } from "@/lib/actions/notification.actions";
import ProfileTabs from "@/components/shared/ProfileTabs";
import ThreadsTab from "@/components/shared/UserThreadsTab";
import RepliesTab from "@/components/shared/UserRepliesTab";
import TaggedTab from "@/components/shared/TaggedTab";
import NotificationsTab from "@/components/shared/NotificationsTab";
import ActivityTab from "@/components/shared/ActivityTab";

async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(params.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  // Get unread notifications count if viewing own profile
  let unreadCount = 0;
  if (userInfo.id === user.id) {
    unreadCount = await getUnreadNotificationsCount(user.id);
  }

  return (
    <section>
      <ProfileHeader
        accountId={userInfo.id}
        authUserId={user.id}
        name={userInfo.name}
        username={userInfo.username}
        imgUrl={userInfo.image}
        bio={userInfo.bio}
      />

      <ProfileTabs 
        userInfo={userInfo}
        userId={user.id}
        unreadCount={unreadCount}
      />
    </section>
  );
}

export default Page;