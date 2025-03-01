"use client"
import React, { useEffect, useState } from 'react'
import { Button, } from './ui/button'
import {  ScrollArea, ScrollBar } from './ui/scroll-area'
import {  X } from 'lucide-react'
import { useParams } from 'next/navigation'
import { usePageStore } from '@/store/use-page-store'
import { ChatBot } from '@/app/(main)/(routes)/documents/[...pages]/_components/chatBot'
import Document from './Document'
import StackedDocument from './StackedPage'


const ScreenLayout = () => {
  const params = useParams();
  const pageParams = Array.isArray(params.pages)
    ? params.pages
    : params.pages
      ? [params.pages]
      : [];

        const { isChatOpen,  toggleChat,tabs, activeTab, removeTab, setActiveTab, selectedText, isStackOpen } = usePageStore();
        const activeTabData = tabs.find((tab) => tab.title === activeTab)

      // Use this to prevent hydration mismatch
        const [isClient, setIsClient] = useState(false)

        useEffect(() => {
    setIsClient(true)
  }, [])


      if (!isClient) {
        return <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      }
  return (
    <div className="relative flex flex-1 h-full w-full">
    {/* Left Pane */}
    <div className={`${isChatOpen || (isStackOpen &&  activeTab)?'w-1/2':'w-full'}  border-r`}>
     <div className="flex-1 overflow-y-auto h-full"> 
        {pageParams[0] && <Document uuid={pageParams[0]} />}
      </div> 
    </div>

    {/* Right Pane */}
   {activeTabData && isStackOpen && <div 
      className={`absolute bg-background top-0 left-0 w-1/2 h-full flex flex-col border-r transition-transform duration-300 ease-in-out z-10 ${
        selectedText.pageType !== "stack" ? 'translate-x-full' :
        isChatOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex h-14 items-center justify-between border-b p-4 bg-background ">
      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
        <div className="flex w-max space-x-2 p-2">
          {tabs.map((tab) => (
            <Button
              key={tab.title}
              variant={tab.title === activeTab ? "default" : "outline"}
              className="px-3 py-1 text-sm"
              onClick={() => setActiveTab(tab.title)}
              title={tab.title}
            >
              {tab.title.length > 6 ? tab.title.substring(0, 6) + "..." : tab.title}
              <X
                className="ml-2 h-4 w-4 hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  removeTab(tab.title)
                }}
              />
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      </div>
      {activeTabData.url?<StackedDocument uuid={activeTabData.url} />:<div>Loading..</div>}
    </div>}

    {/* Third Pane */}
    <div 
      className={`absolute top-0 right-0 w-1/2 h-full flex flex-col border-l transition-transform duration-300 ease-in-out z-20 ${
        isChatOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex h-14 items-center justify-between border-b px-4 bg-background">
        <h2 className="text-lg font-semibold">Document Assistant</h2>
        <Button variant="ghost" size="icon" onClick={toggleChat}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-background">
        <ChatBot pageId={pageParams[0]} />
      </div>
    </div>
  </div>
  )
}
export default ScreenLayout