import { TestBed } from '@angular/core/testing';

import { WebsocketServiceTsService } from './websocket.service';

describe('WebsocketServiceTsService', () => {
  let service: WebsocketServiceTsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebsocketServiceTsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
