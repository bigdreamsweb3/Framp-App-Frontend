"use client"

import { useState, useEffect } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion } from "framer-motion"
import { Button } from "../components/ui/button"
import { Bot, User, LogOut } from "lucide-react"
import Image from "next/image"
import { app_logo } from "@/asssets/image"
import { App_Name } from "@/app/appConfig"
import { useAuth } from "@/context/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
// import { DynamicConnectButton, DynamicWidget } from "@dynamic-labs/sdk-react-core"

interface AppHeaderProps {
  onAuthClick?: () => void
  chatActive?: boolean
  onChatToggle?: () => void
  onProfileClick?: () => void
}

export function AppHeader({ onAuthClick, chatActive, onChatToggle, onProfileClick }: AppHeaderProps) {
  const [scrolled, setScrolled] = useState(false)

  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-border/40 bg-background/90 backdrop-blur-md transition-all duration-300 ease-out
        ${scrolled ? "shadow-lg py-0 h-14" : "shadow-sm py-1 h-14"}`}
      data-tour="security"
    >
      <div className="w-full h-full pl-0 pr-4 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0">
            <div className="relative flex items-center">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/30 to-primary/5 blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
              <Image
                src={app_logo}
                alt="App Logo"
                className="relative w-[max(2.5rem,5vh)] h-auto object-contain rounded-r-2xl"
              />
            </div>
            {/* Vertical Beta Badge - positioned beside logo */}
            <span className="text-[0.55rem] font-bold px-1 py-2 text-muted-foreground transform -rotate-90 origin-center  ml-0">
              BETA
            </span>
          </div>
          {/* <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.4 }}
            className="hidden md:inline-flex text-lg font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent"
          >
            {App_Name}
          </motion.span> */}
        </div>




        {/* Navigation and Actions */}
        <div className="flex items-center gap-4">
          {/* AI Toggle Button */}
          {/* <Button
            variant={chatActive ? "default" : "outline"}
            size="sm"
            onClick={onChatToggle}
            className="flex items-center gap-1.5 h-9 rounded-xl transition-all duration-200 hover:shadow-md"
            data-tour="chat-button"
            aria-pressed={chatActive}
          >
            <Bot className="h-4 w-4" />
            <span className="text-xs font-medium">AI</span>
          </Button> */}

          {/* Theme Toggle */}
          <ThemeToggle />



          {!user ? (
            <>
              <Button
                onClick={onAuthClick}
                variant="default"
                size="sm"
                className="h-9 px-4 rounded-xl font-medium text-sm bg-primary hover:bg-primary/90 transition-colors"
                aria-label="Log in or sign up"
              >
                Sign in
              </Button>
            </>
          ) : (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                    aria-label="User menu"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={(user as any)?.user?.name || (user as any).user?.name || "User"} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                        {(user as any)?.user?.name ? (user as any).user.name.charAt(0).toUpperCase() : (user as any)?.user?.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{(user as any)?.user?.name || (user as any).user?.name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {(user as any)?.user?.email || (user as any).user?.email || "No email"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onProfileClick} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}


          {/* <DynamicConnectButton>{<Button
            // onClick={onAuthClick}
            variant="default"
            size="sm"
            className="h-9 px-4 rounded-xl font-medium text-sm bg-primary hover:bg-primary/90 transition-colors"
            aria-label="Log in or sign up"
          >
            Sign in
          </Button>}</DynamicConnectButton> */}
          {/* 
          <DynamicWidget
            innerButtonComponent={<> <Button
              // onClick={onAuthClick}
              variant="default"
              size="sm"
              className="h-9 px-4 rounded-xl font-medium text-sm bg-primary hover:bg-primary/90 transition-colors"
              aria-label="Log in or sign up"
            >
              Sign in
            </Button></>}
          /> */}

          {/* Sign In Button */}
          {/* <Button
            onClick={onAuthClick}
            variant="default"
            size="sm"
            className="h-9 px-4 rounded-xl font-medium text-sm bg-primary hover:bg-primary/90 transition-colors"
            aria-label="Log in or sign up"
          >
            Sign in
          </Button> */}
        </div>
      </div>
    </header>
  )
}




<div id="popInvest" class="pop_invest_cont z-40">
    <div class="flex flex-wrap justify-center">


        <div class="pop_up_card" align="center">
            <div class="py-3 mb-7 text-gray-700">
                <h3 class="text-lg font-bold">{{ __('Investment in asset') }}</h3>
                <h5 class="p-2 text-sm font-bold border-b-2 border-gray-100">{{ __('Wallet Balance:') }} <span class="mr-1 px-2 py-auto text-xs font-bold text-green-100 rounded-lg bg-green-300 shadow-md">{{$settings->currency}}</span> <b><span id="WalletBal"></span></b></h5>
            </div>
            <div class="pop_msg_content p-4">
                <form id="userpackinv" action="/invest" method="post">
                    @csrf
                    <div class="px-4 grid justify-items-center">
                        <div class="mb-3 text-sm text-right">
                            <div class="flex w-full">
                                <div class="w-1/2">
                                    {{ __('Asset:') }}
                                </div>
                                <div class="w-1/2 text-gray-600 text-xs capitalize">
                                    <span id="asset"></span>
                                </div>
                            </div>
                            <div class="flex w-full">
                                <div class="w-1/2">
                                    {{ __('Package:') }}
                                </div>
                                <div class="w-1/2 text-gray-600 text-xs">
                                    <span id="pack_inv"></span>
                                </div>
                            </div>
                            <div class="flex w-full">
                                <div class="w-1/2">
                                    {{ __('ROI:') }}
                                </div>
                                <div class="w-1/2 text-gray-600 text-xs">
                                    <span id="intr"></span>%
                                </div>
                            </div>
                            <div class="flex w-full">
                                <div class="w-1/2">
                                    {{ __('Period:') }}
                                </div>
                                <div class="w-1/2 text-gray-600 text-xs">
                                    <span id="period"></span><label for="text">{{ __(' Hrs')}}</label>
                                </div>
                            </div>
                            <div class="flex w-full">
                                <div class="w-1/2">
                                    {{ __('Min. Capital:') }}
                                </div>
                                <div class="w-1/2 text-gray-600 text-xs">
                                    <span id="min"></span>
                                </div>
                            </div>
                            <div class="flex w-full">
                                <div class="w-1/2">
                                    {{ __('Max. Capital:') }}
                                </div>
                                <div class="w-1/2 text-gray-600 text-xs">
                                    <span id="max"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group" align="center">
                        <br>
                        <label class="p-2 font-bold text-gray-500 mb-3">{{ __('Enter Amount to Invest') }}</label>
                        <input type="hidden" class="form-control" name="_token" value="{{csrf_token()}}">
                        <input id="p_id" type="hidden" class="form-control" name="p_id" value="">
                        <input id="a_id" type="hidden" class="form-control" name="a_id" value="">
                        <input type="text" class="mb-5 rounded-md shadow-sm form-input block max-w-50 pl-7 pr-12 sm:text-sm sm:leading-5" name="capital" placeholder="Enter capital to invest" required>
                    </div>
                    <div class="form-group">
                        <button class="bg-{{$settings->target_color }}-500 hover:bg-{{$settings->target_color }}-400 text-white font-bold py-2 px-4 border-b-4 border-{{$settings->target_color }}-700 hover:border-{{$settings->target_color }}-500 rounded">{{ __('Proceed') }}</button>
                        <span>
                            <a id="popMsg_close_user" href="javascript:void(0)" class="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 border-b-4 border-red-700 hover:border-red-500 rounded" onclick="closePop()">{{ __('Cancel') }}</a>
                        </span>
                        <br><br>
                    </div>
                </form>

            </div>
        </div>
    </div>
</div>



@include('layouts.inc.top_header')

<div class="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
  <!-- Hero Section with Background -->
  <div class="relative h-96 flex items-center justify-center overflow-hidden" style="background-image: url('img/vu-red-bg.png'); background-size: cover; background-position: center;">
    <!-- Dark Overlay -->
    <div class="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60"></div>
    
    <!-- Hero Content -->
    <div class="relative z-10 text-center px-6">
      <h1 class="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
        {{ __('About') }} <span class="text-blue-400">Vortic United</span>
      </h1>
      <p class="text-xl text-gray-200 max-w-2xl mx-auto">
        {{ __('Breaking barriers in institutional trading since 2020') }}
      </p>
    </div>
  </div>

  <!-- Main Content -->
  <div class="max-w-7xl mx-auto px-6 py-16">
    
    <!-- Story Section -->
    <div class="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
      <div class="max-w-4xl mx-auto">
        <div class="mb-8">
          <span class="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-4">
            {{ __('Our Story') }}
          </span>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-6 leading-tight">
            {{ __('In 2020, an idea was sparked by Jensen Robles, the visionary CEO and founder of Vortic United.') }}
          </h2>
        </div>
        
        <div class="prose prose-lg text-gray-600 space-y-6">
          <p class="text-lg leading-relaxed">
            He envisioned a platform that would break down barriers and make institutional trading systems accessible to everyone.
            After months of meticulous planning, Vortic United entered the pre-launch stage in September 2022.
          </p>
          <p class="text-lg leading-relaxed">
            With a relentless pursuit of perfection, the team refined the platform to meet the highest standards.
            The dedication and hard work paid off as Vortic United achieved a significant milestone on December 27, 2022,
            with its global launch and international expansion. The rapid recognition worldwide quickly propelled the
            company into the global spotlight.
          </p>
        </div>
      </div>
    </div>

    <!-- Two Column Section -->
    <div class="grid md:grid-cols-2 gap-8">
      
      <!-- Mission Section -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <div class="flex items-center mb-6">
          <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
            <i class="fas fa-rocket text-white text-xl"></i>
          </div>
          <h3 class="text-2xl font-bold text-gray-800">{{ __('Our Mission') }}</h3>
        </div>
        <p class="text-gray-600 leading-relaxed text-lg">
          Vortic United continues to innovate and expand globally, driven by a mission to make powerful trading tools
          and institutional-level opportunities accessible to everyone worldwide.
        </p>
        
        <!-- Stats -->
        <div class="grid grid-cols-2 gap-4 mt-8">
          <div class="bg-blue-50 rounded-lg p-4 text-center">
            <div class="text-3xl font-bold text-blue-600">2020</div>
            <div class="text-sm text-gray-600 mt-1">Founded</div>
          </div>
          <div class="bg-blue-50 rounded-lg p-4 text-center">
            <div class="text-3xl font-bold text-blue-600">2022</div>
            <div class="text-sm text-gray-600 mt-1">Global Launch</div>
          </div>
        </div>
      </div>

      <!-- Contact Section -->
      <div class="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 text-white">
        <div class="flex items-center mb-6">
          <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
            <i class="fas fa-envelope text-white text-xl"></i>
          </div>
          <h3 class="text-2xl font-bold">{{ __('Get In Touch') }}</h3>
        </div>
        
        <p class="text-blue-100 mb-8 text-lg">
          Contact us and we'll get back to you within 24 hours.
        </p>

        <div class="space-y-5">
          <!-- Address -->
          <div class="flex items-start">
            <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
              <i class="fa fa-map-marker text-white"></i>
            </div>
            <div>
              <div class="font-semibold mb-1">{{ __('Address') }}</div>
              <p class="text-blue-100">86 Paul Street, London, England</p>
            </div>
          </div>

          <!-- Email -->
          <div class="flex items-start">
            <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
              <i class="fa fa-life-ring text-white"></i>
            </div>
            <div>
              <div class="font-semibold mb-1">{{ __('Support Email') }}</div>
              <a href="mailto:send@VORTIC-UNITED.org" class="text-blue-100 hover:text-white transition">
                send@VORTIC-UNITED.org
              </a>
            </div>
          </div>
        </div>

        <!-- CTA Button -->
        <button class="w-full mt-8 bg-white text-blue-600 font-bold py-4 px-6 rounded-lg hover:bg-blue-50 transition duration-300 shadow-lg">
          <i class="fas fa-paper-plane mr-2"></i>
          {{ __('Contact Support') }}
        </button>
      </div>
    </div>

  </div>
</div>

@include('layouts.inc.footer')