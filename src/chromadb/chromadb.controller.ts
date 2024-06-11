import { Body, Controller, Get, Post } from "@nestjs/common";
import { ChromadbService } from "./chromadb.service";

@Controller('chromadb')
export class ChromadbController {
    constructor(private readonly chromadbService: ChromadbService) { }
    
    @Get('crear')
    crearColeccion() {
        return this.chromadbService.crearColeccion();
    }

    @Post('consultar')
    consultar(@Body() body: any) {
        return this.chromadbService.consultar(body);
    }

    @Post('eliminar')
    eliminarColeccion(@Body() body: any) {
        return this.chromadbService.eliminarColeccion(body);
    }

    @Get('probar')
    probar() {
        return this.chromadbService.probar();
    }
}