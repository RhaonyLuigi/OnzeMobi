import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const pagesBasePath = process.env.ONZE_PAGES_BASE_PATH;
  return {
    ...config,
    name: config.name ?? "ONZE mobi",
    slug: config.slug ?? "onze-mobi",
    web: {
      ...config.web,
      ...(pagesBasePath ? { output: "static" as const } : {}),
    },
    experiments: {
      ...config.experiments,
      ...(pagesBasePath ? { baseUrl: pagesBasePath } : {}),
    },
  };
};
