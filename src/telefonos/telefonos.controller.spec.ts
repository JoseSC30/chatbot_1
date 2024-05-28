import { Test, TestingModule } from '@nestjs/testing';
import { TelefonosController } from './telefonos.controller';
import { TelefonosService } from './telefonos.service';

describe('TelefonosController', () => {
  let controller: TelefonosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TelefonosController],
      providers: [TelefonosService],
    }).compile();

    controller = module.get<TelefonosController>(TelefonosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
