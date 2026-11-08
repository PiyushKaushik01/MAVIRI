import { AuthForm } from "@/components/auth-form";
import { SiteShell } from "@/components/site-shell";

export default function SignInPage() {
  return <SiteShell active="account"><div className="maviri-auth-layout"><AuthForm /><aside className="maviri-auth-aside"><span>ANIME / COMMUNITY / YOU</span><p>A collection can be personal. The conversations around it can be yours, too.</p><b>M / 07</b></aside></div></SiteShell>;
}
