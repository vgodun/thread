'use client';

import { OrganizationSwitcher, SignedIn, SignInButton, SignOutButton, useAuth } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Image from "next/image";
import Link from "next/link";

function Topbar() {
    const { userId } = useAuth();
    return (
        <nav className='topbar'>
            <Link href='/' className='flex items-center gap-4'>
                <Image src='/assets/logo.svg' alt='logo' width={28} height={28} />
                <p className='text-heading3-bold text-light-1 max-xs:hidden'>Threads</p>
            </Link>

            <div className='flex items-center gap-1'>
                <div className='block md:hidden'>
                    {!userId && (
                        <SignInButton>
                            <div className='flex cursor-pointer gap-4 p-4'>
                                <Image
                                    src='/assets/login.svg'
                                    alt='login'
                                    width={24}
                                    height={24}
                                />
                                <p className='text-light-2 max-lg:hidden'>SignIn/SignUp</p>
                            </div>
                        </SignInButton>
                    )}
                    <SignedIn>
                        <SignOutButton>
                            <div className='flex cursor-pointer'>
                                <Image
                                    src='/assets/logout.svg'
                                    alt='logout'
                                    width={24}
                                    height={24}
                                />
                            </div>
                        </SignOutButton>
                    </SignedIn>
                </div>

                <OrganizationSwitcher
                    appearance={{
                        baseTheme: dark,
                        elements: {
                            organizationSwitcherTrigger: "py-2 px-4",
                        },
                    }}
                />
            </div>
        </nav>
    );
}

export default Topbar;