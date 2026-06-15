"use client"

import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import { FcGoogle } from "react-icons/fc"
import { FaGithub } from "react-icons/fa"

type SocialsProps = {
  callbackUrl?: string
}

function getSafeCallbackUrl(callbackUrl?: string) {
  if (!callbackUrl) return "/"
  if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) return "/"
  return callbackUrl
}

export default function Socials({ callbackUrl }: SocialsProps) {
  const safeCallbackUrl = getSafeCallbackUrl(callbackUrl)

  return (
    <div className="flex flex-col items-center w-full gap-4">
      <Button
        variant={"outline"}
        className="flex gap-4 w-full"
        onClick={() =>
          signIn("google", {
            callbackUrl: safeCallbackUrl,
          })
        }
      >
        <p>Sign in with Google</p>
        <FcGoogle className="w-5 h-5" />
      </Button>
      <Button
        className="flex gap-4 w-full"
        variant={"outline"}
        onClick={() =>
          signIn("github", {
            callbackUrl: safeCallbackUrl,
          })
        }
      >
        Sign in with Github
        <FaGithub className="w-5 h-5" />
      </Button>
    </div>
  )
}
