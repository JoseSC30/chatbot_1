import { Injectable } from '@nestjs/common';
import { ChromaClient } from 'chromadb';
import { OpenAIEmbeddingFunction } from 'chromadb';
import { enfermedades } from './enfermedades';
require('dotenv').config();

@Injectable()
export class ChromadbService {
    private client: ChromaClient;
    private embedder = new OpenAIEmbeddingFunction({
        openai_api_key: process.env.OPENAI_API_KEY
    });

    constructor() {
        this.client = new ChromaClient({ 
            path: process.env.CHROMA_SERVER_URL,
            auth: {
                provider: "token",
                credentials: process.env.CHROMA_SERVER_CREDENTIALS
              },
          })
    }

    async crearColeccion() {
        try {
            const collection = await this.client.createCollection({
                name: "enfermedades",
                embeddingFunction: this.embedder,
            })

            await collection.add({
                ids: ["id1", "id2", "id3", "id4", "id5", "id6", "id7", "id8", "id9", "id10", "id11", "id12"],
                metadatas: [
                    { "Enfermedad": "gripe"},
                    { "Enfermedad": "resfrio"},
                    { "Enfermedad": "anemia"},
                    { "Enfermedad": "diabetes"},
                    { "Enfermedad": "hipertension"},
                    { "Enfermedad": "asma"},
                    { "Enfermedad": "acidesEstomacal"},
                    { "Enfermedad": "gastritis"},
                    { "Enfermedad": "colitis"},
                    { "Enfermedad": "insonmio"},
                    { "Enfermedad": "estres"},
                    { "Enfermedad": "estrenimiento"}
                ],
                documents: [
                    enfermedades().gripe,
                    enfermedades().resfrio,
                    enfermedades().anemia,
                    enfermedades().diabetes,
                    enfermedades().hipertension,
                    enfermedades().asma,
                    enfermedades().acidesEstomacal,
                    enfermedades().gastritis,
                    enfermedades().colitis,
                    enfermedades().insonmio,
                    enfermedades().estres,
                    enfermedades().estrenimiento
                ],
            })
            console.log("Coleccion Creada - Documentos agregados")
            return "Coleccion Creada - Documentos agregados"
        } catch (error) {
            console.log(error)
            return error
        }
    }

    async consultar(body: any) {
        try {
            const collection = await this.client.getCollection({
                name: body.coleccion,
                embeddingFunction: this.embedder
            });
            const results = await collection.query({
                queryTexts: [body.contenido],
                nResults: 2
            });
            console.log(results)
            return results
        } catch (error) {
            console.log(error)
            return error
        }
    }

    async eliminarColeccion(body: any) {
        await this.client.deleteCollection({ name: body.coleccion });
        console.log("Collection eliminada")
        return "Collection eliminada"
    }

    async probar() {
        const res = await this.client.listCollections()//Lista todas las colecciones
        // const res = await this.client.countCollections()//Cantidad de colecciones

        // const coleccion = await this.client.getCollection({ name: "enfermedades" })//Obtiene una coleccion
        // const res = await coleccion.get({ limit: 20 });//Obtiene todos los documentos de una coleccion
        console.log(res)
        return res
    }
}