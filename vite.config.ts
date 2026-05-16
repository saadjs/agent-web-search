import { defineConfig, type Plugin } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
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
    devtools(),
    siteMetadataPlugin(),
    viteTsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    viteReact(),
  ],
  server: { port: 3000 },
})
