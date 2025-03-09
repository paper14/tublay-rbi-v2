import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/">
                    {/* <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" /> */}
                    <h1 className="font-bold">Tublay RBI V2</h1>
                </Link>
            </div>

            <div className="mt-5 columns-3">
                <div className="flex items-center justify-center">
                    <img width="100" src="/images/tublay-logo.png" />
                </div>
                <div className="flex items-center justify-center">
                    <img width="100" src="/images/lcro-logo.png" />
                </div>
                <div className="flex items-center justify-center">
                    <img width="100" src="/images/bagong-pilipinas-logo.png" />
                </div>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
