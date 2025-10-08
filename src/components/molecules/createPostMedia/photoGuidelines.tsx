import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { useTranslations } from 'next-intl'
import {
  Check,
  X,
  Info,
  ChevronRight,
  ChevronDown,
  Camera,
  RotateCcw,
} from 'lucide-react'

const PhotoGuidelines: React.FC = () => {
  const t = useTranslations('createPost.sections.media')
  // Separate collapsibles for Normal Photos and 360° Photos
  const [openNormal, setOpenNormal] = useState(false)
  const [open360, setOpen360] = useState(false)

  return (
    <Card className='mb-6 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800'>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center justify-between text-lg'>
          <div className='flex items-center gap-2'>
            <Info className='w-4 h-4' /> {t('guidelines.title')}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Normal Photos collapsible */}
        <div className='rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden'>
          <button
            type='button'
            onClick={() => setOpenNormal((v) => !v)}
            className='w-full flex items-center justify-between px-3 sm:px-4 py-3 bg-gray-50 dark:bg-gray-900/40 hover:bg-gray-100 dark:hover:bg-gray-900/60 transition-colors'
          >
            <div className='flex items-center gap-2 font-medium'>
              {openNormal ? (
                <ChevronDown className='w-4 h-4' />
              ) : (
                <ChevronRight className='w-4 h-4' />
              )}
              <Camera className='w-4 h-4' />
              <span>{t('guidelines.normalTitle')}</span>
            </div>
            <span className='text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800'>
              {t('guidelines.normalCount')}
            </span>
          </button>
          {openNormal && (
            <div className='p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-4'>
              <ul className='space-y-2 text-sm'>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-green-600 mt-0.5' />
                  <span>{t('guidelines.do.naturalLight')}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-green-600 mt-0.5' />
                  <span>{t('guidelines.do.tidyRoom')}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-green-600 mt-0.5' />
                  <span>{t('guidelines.do.variousAngles')}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-green-600 mt-0.5' />
                  <span>{t('guidelines.do.includeAmenities')}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-green-600 mt-0.5' />
                  <span>{t('guidelines.do.nightShots')}</span>
                </li>
              </ul>
              <ul className='space-y-2 text-sm'>
                <li className='flex items-start gap-2'>
                  <X className='w-4 h-4 text-red-600 mt-0.5' />
                  <span>{t('guidelines.dont.lowLight')}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <X className='w-4 h-4 text-red-600 mt-0.5' />
                  <span>{t('guidelines.dont.showPersonal')}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <X className='w-4 h-4 text-red-600 mt-0.5' />
                  <span>{t('guidelines.dont.repetitiveAngles')}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <X className='w-4 h-4 text-red-600 mt-0.5' />
                  <span>{t('guidelines.dont.overEdit')}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <X className='w-4 h-4 text-red-600 mt-0.5' />
                  <span>{t('guidelines.dont.tooDarkOrBright')}</span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* 360 Photos collapsible */}
        <div className='rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden'>
          <button
            type='button'
            onClick={() => setOpen360((v) => !v)}
            className='w-full flex items-center justify-between px-3 sm:px-4 py-3 bg-gray-50 dark:bg-gray-900/40 hover:bg-gray-100 dark:hover:bg-gray-900/60 transition-colors'
          >
            <div className='flex items-center gap-2 font-medium'>
              {open360 ? (
                <ChevronDown className='w-4 h-4' />
              ) : (
                <ChevronRight className='w-4 h-4' />
              )}
              <RotateCcw className='w-4 h-4' />
              <span>{t('guidelines.panoramaTitle')}</span>
            </div>
            <span className='text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800'>
              {t('guidelines.panoramaCount')}
            </span>
          </button>
          {open360 && (
            <div className='p-3 sm:p-4 text-sm rounded-b-lg border-t border-gray-200 dark:border-gray-800'>
              <div className='rounded-md border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 p-3 mb-3'>
                <div className='flex items-start gap-2'>
                  <Info className='w-4 h-4 text-blue-600 mt-0.5' />
                  <div>
                    <div className='font-medium text-blue-900 dark:text-blue-100'>
                      {t('guidelines.autoDetectTitle')}
                    </div>
                    <p className='text-blue-900/90 dark:text-blue-100/90'>
                      {t('guidelines.autoDetectDesc')}
                    </p>
                  </div>
                </div>
              </div>
              <div className='font-medium mb-2'>
                {t('guidelines.howTo360Title')}
              </div>
              <ul className='list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300'>
                <li>{t('guidelines.howTo.use360Camera')}</li>
                <li>{t('guidelines.howTo.usePhonePanorama')}</li>
                <li>{t('guidelines.howTo.filenameHints')}</li>
                <li>{t('guidelines.howTo.aspectRatio')}</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export { PhotoGuidelines }
