const CopyPlugin = require("copy-webpack-plugin");
/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        appDir: true,
    },
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        // Note: we provide webpack above so you should not `require` it
        // Perform customizations to webpack config
        if (process.env.NODE_ENV == 'development') {
            config.plugins.push(
                new CopyPlugin({
                    patterns: [
                        {
                            from: './node_modules/frete/correios-data/calcPrecoPrazo.xml',
                            to: './server/app/api/v1/frete/correios-data/calcPrecoPrazo.xml',
                        },
                        {
                            from: './node_modules/frete/correios-data/listaServicos.json',
                            to: './server/app/api/v1/frete/correios-data/listaServicos.json',
                        },
                    ],
                })
            )
        }
        // Important: return the modified config
        return config
    },
}

module.exports = nextConfig
