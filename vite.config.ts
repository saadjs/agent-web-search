import { defineConfig, type Plugin } from "vite"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import viteReact from "@vitejs/plugin-react"
import viteTsConfigPaths from "vite-tsconfig-paths"
import tailwindcss from "@tailwindcss/vite"

function normalizeSiteUrl(value: string | undefined) {
  return value?.replace(/\/+$/, "") ?? ""
}

function siteMetadataPlugin(): Plugin {
  const siteUrl = normalizeSiteUrl(
    process.env.SITE_URL ?? process.env.VITE_SITE_URL ?? process.env.CF_PAGES_URL,
  )

  return {
    name: "site-metadata",
    transformIndexHtml(html) {
      return html.replaceAll("__SITE_URL__", siteUrl)
    },
  }
}

export default defineConfig({
  plugins: [
    siteMetadataPlugin(),
    viteTsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    viteReact(),
  ],
  server: { port: 3000 },
})
