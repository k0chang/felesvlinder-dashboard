import { useNavigate } from "@remix-run/react";
import { getAuth } from "firebase/auth";
import { PowerOff } from "lucide-react";
import { Button } from "../ui/button";

export function SignOutButton() {
  const auth = getAuth();
  const navigate = useNavigate();

  return (
    <Button
      title="Sign out"
      variant={"ghost"}
      type="button"
      onClick={async () => {
        await auth.signOut();
        navigate("/sign-in");
      }}
      className="p-0 h-9 w-9 border border-white rounded-full hover:rounded-full hover:bg-transparent hover:border-red-500 [&_.lucide-power-off]:hover:text-red-500 [&_.lucide-power-off]:transition-colors [&_.lucide-power-off]:duration-100"
    >
      <PowerOff size={16} />
    </Button>
  );
}
