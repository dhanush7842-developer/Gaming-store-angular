import { TestBed } from '@angular/core/testing';
import { RecentlyViewedService } from './recently-viewed.service';

describe('RecentlyViewedService', () => {
  let recent: RecentlyViewedService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    recent = TestBed.inject(RecentlyViewedService);
  });

  it('starts empty', () => {
    expect(recent.products().length).toBe(0);
  });

  it('puts the newest product first and does not repeat products', () => {
    recent.add(1);
    recent.add(2);
    recent.add(3);
    recent.add(1);
    expect(recent.products().map((p) => p.id)).toEqual([1, 3, 2]);
  });

  it('keeps at most 8 products', () => {
    for (let id = 1; id <= 12; id++) recent.add(id);
    expect(recent.products().length).toBe(8);
    expect(recent.products()[0].id).toBe(12);
  });

  it('keeps earlier saved items when something is added before loading finishes', () => {
    localStorage.setItem('nexus_recent', JSON.stringify([5, 6]));
    recent.add(2); // add() reads the saved list first
    expect(recent.products().map((p) => p.id)).toEqual([2, 5, 6]);
    expect(JSON.parse(localStorage.getItem('nexus_recent')!)).toEqual([2, 5, 6]);
  });

  it('restores after a reload and ignores bad data', () => {
    recent.add(4);
    TestBed.resetTestingModule();
    const restored = TestBed.inject(RecentlyViewedService);
    restored.loadFromStorage();
    expect(restored.products().map((p) => p.id)).toEqual([4]);

    localStorage.setItem('nexus_recent', '{oops');
    TestBed.resetTestingModule();
    const broken = TestBed.inject(RecentlyViewedService);
    broken.loadFromStorage();
    expect(broken.products().length).toBe(0);
  });

  it('clears the list', () => {
    recent.add(1);
    recent.clear();
    expect(recent.products().length).toBe(0);
  });
});
