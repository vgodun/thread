import { getNotifications } from "@/lib/actions/notification.actions";
import { formatDateString } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import ThreadContent from "./ThreadContent";

interface Props {
  currentUserId: string;
  accountId: string;
}

const NotificationsTab = async ({ currentUserId, accountId }: Props) => {
  // Only allow users to view their own notifications
  if (currentUserId !== accountId) {
    redirect(`/profile/${accountId}`);
  }

  const notifications = await getNotifications(accountId);

  return (
    <section className="mt-9 flex flex-col gap-10">
      {notifications.length === 0 ? (
        <p className="no-result">No notifications yet</p>
      ) : (
        <>
          {notifications.map((notification) => {
            // Determine notification content based on type
            let content = "";
            let linkHref = "";

            if (notification.threadId) {
              linkHref = `/thread/${notification.threadId._id}`;
            }

            switch (notification.type) {
              case "mention":
                content = `@${notification.sender.username} mentioned you in a thread`;
                break;
              case "comment":
                content = `@${notification.sender.username} commented on your thread`;
                break;
              case "like":
                content = `@${notification.sender.username} liked your thread`;
                break;
              case "follow":
                content = `@${notification.sender.username} started following you`;
                linkHref = `/profile/${notification.sender._id}`;
                break;
              default:
                content = `@${notification.sender.username} interacted with you`;
            }

            return (
              <article
                key={notification._id}
                className={`flex flex-col rounded-xl ${
                  notification.read ? "bg-dark-3" : "bg-dark-2"
                } p-7 relative`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex w-full flex-1 flex-row gap-4">
                    <div className="flex flex-col items-center">
                      <Link
                        href={`/profile/${notification.sender._id}`}
                        className="relative h-11 w-11 z-10"
                      >
                        <Image
                          src={notification.sender.image}
                          alt="Profile image"
                          fill
                          className="cursor-pointer rounded-full"
                        />
                      </Link>
                      <div className="thread-card_bar" />
                    </div>

                    <div className="flex w-full flex-col">
                      <Link href={`/profile/${notification.sender._id}`} className="w-fit z-10 relative">
                        <h4 className="cursor-pointer text-base-semibold text-light-1">
                          {notification.sender.name}
                        </h4>
                      </Link>

                      <div className="mt-2 text-small-regular text-light-2 relative z-10">
                        <ThreadContent content={content} />
                      </div>

                      {notification.threadId && notification.threadId.text && (
                        <div className="mt-2 text-subtle-medium text-gray-1 relative z-10">
                          <Link href={linkHref}>
                            <p>
                              {notification.threadId.text.length > 100
                                ? `${notification.threadId.text.substring(0, 100)}...`
                                : notification.threadId.text}
                            </p>
                          </Link>
                        </div>
                      )}

                      <p className="mt-2 text-subtle-medium text-gray-1">
                        {formatDateString(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
                
                {linkHref && (
                  <Link href={linkHref} className="absolute inset-0 z-0" aria-hidden="true">
                    <span className="sr-only">View details</span>
                  </Link>
                )}
              </article>
            );
          })}
        </>
      )}
    </section>
  );
};

export default NotificationsTab;
