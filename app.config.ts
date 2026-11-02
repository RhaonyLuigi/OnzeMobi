import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const pagesBasePath = process.env.ONZE_PAGES_BASE_PATH;
  return {
    ...config,
    name: config.name ?? "ONZE mobi",
    slug: config.slug ?? "onze-mobi",
    plugins: [...(config.plugins ?? []), "expo-notifications", "expo-sharing"],
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
