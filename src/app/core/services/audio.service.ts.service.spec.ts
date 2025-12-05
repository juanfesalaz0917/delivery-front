import { TestBed } from '@angular/core/testing';

import { AudioServiceTsService } from './audio.service.ts.service';

describe('AudioServiceTsService', () => {
  let service: AudioServiceTsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioServiceTsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
