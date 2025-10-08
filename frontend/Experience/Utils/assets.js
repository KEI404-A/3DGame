export default [
    {
        westgate: {
            assets: [
                {
                    name: "modernCityBlock", 
                    type: "glbModel",
                    path: "/models/full_gameready_city_buildings.glb", // Pakai model asli
                },
                {
                    name: "male",
                    type: "glbModel",
                    path: "/models/asian_male_animated.glb",
                },
                {
                    name: "female",
                    type: "glbModel",
                    path: "/models/asian_female_animated.glb",
                },
                {
                    name: "environment",
                    type: "cubeTexture",
                    path: [
                        "textures/environment/px.png",
                        "textures/environment/nx.png",
                        "textures/environment/py.png",
                        "textures/environment/ny.png",
                        "textures/environment/pz.png",
                        "textures/environment/nz.png",
                    ],
                },
            ],
        },
    },
];
