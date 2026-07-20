import { describe, expect, it } from 'vitest'

import { resolveValuationAddress } from './housingPredictor'

describe('resolveValuationAddress', () => {
  describe('legacy three-level address', () => {
    it('reads province/district/ward from the raw legacy text', () => {
      expect(
        resolveValuationAddress(
          { legacyAddressText: 'Hà Nội - Thanh Xuân - Khương Đình' },
          '',
        ),
      ).toEqual({
        city: 'Hà Nội',
        district: 'Thanh Xuân',
        ward: 'Khương Đình',
      })
    })

    it('does not leak the street into the city', () => {
      // Regression: the old code split `composedLegacyAddress`, which is
      // "<street>, <province> - <district> - <ward>", so the city came out as
      // "123 Nguyễn Trãi, Hà Nội".
      const result = resolveValuationAddress(
        { legacyAddressText: 'Hà Nội - Thanh Xuân - Khương Đình' },
        '123 Nguyễn Trãi, Khương Đình, Hà Nội',
      )
      expect(result?.city).toBe('Hà Nội')
      expect(result?.city).not.toContain('Nguyễn Trãi')
    })

    it('takes precedence over the new address', () => {
      const result = resolveValuationAddress(
        {
          legacyAddressText: 'Hà Nội - Thanh Xuân - Khương Đình',
          newProvinceName: 'Hà Nội',
          newWardName: 'Phường Khương Đình',
        },
        '',
      )
      expect(result?.district).toBe('Thanh Xuân')
    })
  })

  describe('new two-level address', () => {
    it('prefers the structured names', () => {
      expect(
        resolveValuationAddress(
          { newProvinceName: 'Hà Nội', newWardName: 'Phường Khương Đình' },
          '123 Nguyễn Trãi, Phường Khương Đình, Hà Nội',
        ),
      ).toEqual({
        city: 'Hà Nội',
        district: 'Phường Khương Đình',
        ward: 'Phường Khương Đình',
      })
    })

    it('never uses the street as the district', () => {
      // Regression: the old code read the third-from-last comma segment as the
      // district, which on a two-level address is the street.
      const result = resolveValuationAddress(
        {},
        '123 Nguyễn Trãi, Phường Khương Đình, Hà Nội',
      )
      expect(result?.district).not.toContain('Nguyễn Trãi')
      expect(result).toEqual({
        city: 'Hà Nội',
        district: 'Phường Khương Đình',
        ward: 'Phường Khương Đình',
      })
    })

    it('falls back to parsing the composed address tail', () => {
      expect(
        resolveValuationAddress({}, 'Phường Khương Đình, Hà Nội'),
      ).toEqual({
        city: 'Hà Nội',
        district: 'Phường Khương Đình',
        ward: 'Phường Khương Đình',
      })
    })

    it('fills only the missing half from the composed address', () => {
      const result = resolveValuationAddress(
        { newProvinceName: 'Hà Nội' },
        '123 Nguyễn Trãi, Phường Khương Đình, Hà Nội',
      )
      expect(result?.ward).toBe('Phường Khương Đình')
    })
  })

  describe('incomplete input', () => {
    it('returns null when nothing is available', () => {
      expect(resolveValuationAddress({}, '')).toBeNull()
    })

    it('returns null when only a province is known', () => {
      expect(resolveValuationAddress({}, 'Hà Nội')).toBeNull()
    })

    it('ignores a legacy text with too few parts', () => {
      expect(
        resolveValuationAddress({ legacyAddressText: 'Hà Nội - Thanh Xuân' }, ''),
      ).toBeNull()
    })

    it('trims whitespace and drops empty segments', () => {
      expect(
        resolveValuationAddress(
          { legacyAddressText: '  Hà Nội  -  Thanh Xuân  -  Khương Đình  ' },
          '',
        ),
      ).toEqual({
        city: 'Hà Nội',
        district: 'Thanh Xuân',
        ward: 'Khương Đình',
      })
    })
  })
})
