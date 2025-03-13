import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { profileTabs } from "@/constants";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import Image from "next/image";
import { redirect } from "next/navigation";
import ThreadsTab from "@/components/shared/UserThreadsTab";
import RepliesTab from "@/components/shared/UserRepliesTab";
import TaggedTab from "@/components/shared/TaggedTab";
import NotificationsTab from "@/components/shared/NotificationsTab";
import ActivityTab from "@/components/shared/ActivityTab";
import { getUnreadNotificationsCount } from "@/lib/actions/notification.actions";

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

      <div className="mt-9">
        <Tabs defaultValue="threads" className="w-full">
          <TabsList className="tab">
            {profileTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="tab">
                <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className="object-contain"
                />
                <p className="max-sm:hidden">{tab.label}</p>

                {tab.value === "notifications" && userInfo.id === user.id && unreadCount > 0 && (
                  <p className="ml-1 rounded-sm bg-primary-500 px-2 py-1 !text-tiny-medium text-light-2">
                    {unreadCount}
                  </p>
                )}
                
                {tab.value === "threads" && (
                  <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                    {userInfo.threads.length}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="threads" className="w-full text-light-1">
            <ThreadsTab
              currentUserId={user.id}
              accountId={userInfo.id}
              accountType="User"
              name={userInfo.name}
              username={userInfo.username}
              imgUrl={userInfo.image}
            />
          </TabsContent>

          <TabsContent value="replies" className="w-full text-light-1">
            <RepliesTab
              currentUserId={user.id}
              accountId={userInfo.id}
              accountType="User"
              name={userInfo.name}
              username={userInfo.username}
              imgUrl={userInfo.image}
            />
          </TabsContent>

          <TabsContent value="tagged" className="w-full text-light-1">
            <TaggedTab
              currentUserId={user.id}
              accountId={userInfo.id}
              accountType="User"
              name={userInfo.name}
              username={userInfo.username}
              imgUrl={userInfo.image}
            />
          </TabsContent>

          <TabsContent value="activity" className="w-full text-light-1">
            <ActivityTab
              currentUserId={user.id}
              accountId={userInfo.id}
              accountType="User"
            />
          </TabsContent>

          <TabsContent value="notifications" className="w-full text-light-1">
            <NotificationsTab
              currentUserId={user.id}
              accountId={userInfo.id}
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

export default Page;