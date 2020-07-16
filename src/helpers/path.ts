export function buildPath(basePath: string, additionalPath?: string) {
    return additionalPath
        ? `${basePath.replace(/\/$/, '')}/${additionalPath.replace(/^\//, '')}`
        : basePath;
}
