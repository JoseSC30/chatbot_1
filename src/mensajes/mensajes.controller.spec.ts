import { Test, TestingModule } from '@nestjs/testing';
import { MensajesController } from './mensajes.controller';
import { MensajesService } from './mensajes.service';

describe('MensajesController', () => {
  let controller: MensajesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MensajesController],
      providers: [MensajesService],
    }).compile();

    controller = module.get<MensajesController>(MensajesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
