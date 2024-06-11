import { Module } from "@nestjs/common";
import { ChromadbService } from "./chromadb.service";
import { ChromadbController } from "./chromadb.controller";

@Module({
    controllers: [ChromadbController],
    providers: [ChromadbService],
    exports: [ChromadbService]
})
export class ChromadbModule { }