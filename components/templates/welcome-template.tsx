"use client";

import { Card, Text, Title } from "@tremor/react";
import { AtomButton } from "@/components/atoms/button";
import { useMsal } from "@azure/msal-react";
import type { UserProfile } from "@/services";
import { useRouter } from "next/navigation";
import {
  RiFileTextLine,
  RiCheckDoubleLine,
  RiLightbulbFlashLine,
} from "@remixicon/react";

interface WelcomeSectionProps {
  userProfile?: UserProfile | null;
}

export default function WelcomeSection({ userProfile }: WelcomeSectionProps) {
  const { instance, accounts } = useMsal();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await instance.logoutPopup({
        mainWindowRedirectUri: "/login",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const displayName = userProfile?.name || accounts[0]?.name || "User";
  const displayEmail = userProfile?.email || accounts[0]?.username || "";

  const handleAgentClick = (agentId: number) => {
    if (agentId === 1) {
      router.push("/agents/meeting-converter");
    }
    // Add handlers for other agents as they're created
  };

  const agents = [
    {
      id: 1,
      title: "Meeting to file note converter",
      description:
        "Automatically transcribe and convert meeting recordings into organized file notes",
      icon: RiFileTextLine,
      isFeatured: true,
    },
    {
      id: 2,
      title: "Quality control agent",
      description:
        "Ensure document quality by analyzing and identifying issues before publication",
      icon: RiCheckDoubleLine,
      isFeatured: false,
    },
    {
      id: 3,
      title: "Strategy builder",
      description:
        "Create comprehensive business strategies by analyzing market data and insights",
      icon: RiLightbulbFlashLine,
      isFeatured: false,
    },
  ];

  return (
    <div className="space-y-12">
      <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 p-8">
        <div className="space-y-6">
          {/* Welcome Header with Sign Out */}
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <Title className="text-4xl font-bold text-slate-900">
                Welcome back, {displayName}! 👋
              </Title>
              <Text className="text-lg text-slate-700">{displayEmail}</Text>
            </div>
            <AtomButton
              onClick={handleLogout}
              variant="secondary"
              size="md"
              className="ml-4"
            >
              Sign Out
            </AtomButton>
          </div>

          {/* Description */}
          <p className="text-slate-700 text-base leading-relaxed">
            You have successfully logged in to your dashboard. You can now
            access all features and manage your account.
          </p>
        </div>
      </Card>

      <div>
        <Title className="text-3xl font-bold text-slate-900 mb-8">
          Your AI Agents
        </Title>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => {
            const IconComponent = agent.icon;
            return (
              <Card
                key={agent.id}
                className="border border-slate-200 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleAgentClick(agent.id)}
              >
                <div className="space-y-4 p-6">
                  {/* Icon and Featured Badge */}
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                    {agent.isFeatured && (
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {agent.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {agent.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
