import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { LogOut, Settings, User } from "lucide-react";
import { motion } from "motion/react";
import { CoinIcon } from "./CoinIcon";

interface HeaderProps {
  userName?: string;
  isAdmin?: boolean;
}

export function Header({ userName, isAdmin }: HeaderProps) {
  const { clear, identity } = useInternetIdentity();
  const initials = userName
    ? userName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";
  const shortPrincipal = `${identity?.getPrincipal().toString().slice(0, 8)}…`;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-lg gradient-emerald flex items-center justify-center shadow-emerald">
            <CoinIcon size={18} />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">
            Earn<span className="text-emerald">Hub</span>
          </span>
          {isAdmin && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-gold border border-gold/30">
              Admin
            </span>
          )}
        </motion.div>

        {/* Right side */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          {userName && (
            <span className="hidden sm:block text-sm text-muted-foreground">
              {shortPrincipal}
            </span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full p-0"
                data-ocid="header.open_modal_button"
              >
                <Avatar className="h-9 w-9 border-2 border-emerald/40">
                  <AvatarFallback className="bg-emerald/20 text-emerald font-display font-bold text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-popover border-border"
              data-ocid="header.dropdown_menu"
            >
              <div className="px-3 py-2 border-b border-border">
                <p className="text-sm font-medium text-foreground">
                  {userName || "Guest"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {shortPrincipal}
                </p>
              </div>
              <DropdownMenuItem className="cursor-pointer gap-2 text-muted-foreground hover:text-foreground">
                <User size={14} />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2 text-muted-foreground hover:text-foreground">
                <Settings size={14} />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                onClick={clear}
                data-ocid="header.delete_button"
              >
                <LogOut size={14} />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </div>
    </header>
  );
}
