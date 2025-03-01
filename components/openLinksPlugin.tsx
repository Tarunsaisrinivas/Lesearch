import type { Plugin, PluginOnAnnotationLayerRender } from "@react-pdf-viewer/core"
import { createClient } from "@/lib/supabase/client"
import type { Tab } from "@/store/use-page-store"

const BACKEND_URL = "http://127.0.0.1:8000"

const openLinksPlugin = (
  addTab: (tab: Tab) => void,
  setActiveTab: (title: string) => void,
  updateTabUrl: (title: string, url: string) => void,
): Plugin => {
  const findLinks = (e: PluginOnAnnotationLayerRender) => {
    const links = e.container.querySelectorAll("a")

    if (links) {
      links.forEach((link: HTMLAnchorElement) => {
        link.addEventListener("click", (event) => {
          event.preventDefault() // Prevent default link behavior
          const url = link.href
          const hasColon = url.includes(":")
          if (!hasColon) {
            // relative link, don't open in new tab
            return
          }
          const [scheme, paper_title] = url.split(/:(.+)/)

          console.log(scheme, paper_title)

          // Immediately add the tab with empty URL
          addTab({ title: paper_title, url: "" })
          setActiveTab(paper_title)

          if (!BACKEND_URL) {
            console.error("BACKEND_URL is not set")
            return
          }

          const supabaseClient = createClient()
          supabaseClient.auth.getUser().then(async (user) => {
            if (user.data.user) {
              const url_from_title_url = `/api/semantic-scholar-url?title=${paper_title}`
              fetch(url_from_title_url)
                .then((response) => response.json())
                .then((data) => {
                  if (data.url !== null) {
                    // Update the tab's URL once we have it
                    updateTabUrl(paper_title, data.url)
                  }
                })
            }
          })
        })
      })
    }
  }

  return {
    onAnnotationLayerRender: findLinks,
  }
}

export default openLinksPlugin

