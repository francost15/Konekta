import { SignIn } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-full max-w-md p-4">
                <SignIn />
            </div>
        </div>
    );
}