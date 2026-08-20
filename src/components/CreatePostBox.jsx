import { useEffect, useState } from 'react'
import { Camera, Image, Send, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function CreatePostBox({ onCreate, currentUser }) {
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [posting, setPosting] = useState(false)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl('')
      return undefined
    }
    const objectUrl = URL.createObjectURL(imageFile)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [imageFile])

  function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setUploadError('Choose an image file to attach.')
      return
    }
    if (file.size > 6 * 1024 * 1024) {
      setUploadError('Images must be smaller than 6 MB.')
      return
    }
    setUploadError('')
    setImageFile(file)
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function uploadImage() {
    if (!imageFile) return null
    const extension = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${currentUser.id}/${crypto.randomUUID()}.${extension}`
    const { error } = await supabase.storage.from('post-media').upload(path, imageFile, {
      cacheControl: '3600',
      contentType: imageFile.type,
      upsert: false,
    })
    if (error) return fileToDataUrl(imageFile)
    const { data } = supabase.storage.from('post-media').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!content.trim() || posting) return
    setPosting(true)
    try {
      const imageUrl = await uploadImage()
      const success = await onCreate({ content: content.trim(), imageUrl })
      if (success) { setContent(''); setImageFile(null) }
    } catch {
      setUploadError('This image could not be attached. Try a smaller image.')
    } finally {
      setPosting(false)
    }
  }

  const profile = currentUser?.user_metadata || {}
  const avatar = profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name || 'You')}&background=4A7A8C&color=F5F7F8`

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-[#F5F7F8] p-5 shadow-[0_12px_32px_rgba(46,59,66,0.07)] dark:bg-[#2E3B42] dark:shadow-none">
      <div className="flex gap-3">
        <img src={avatar} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
        <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Share something with your private circle..." rows={3} required className="min-h-20 flex-1 resize-none bg-transparent pt-1 text-sm leading-6 text-[#2E3B42] outline-none placeholder:text-[#4A7A8C]/60 dark:text-[#F5F7F8]" />
      </div>
      <div className="mt-4 flex flex-col gap-4 border-t border-[#D1E0E3] pt-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-[#D1E0E3] px-3 text-xs font-bold text-[#2E3B42] transition hover:bg-[#8FBC94] dark:bg-[#4A7A8C] dark:text-[#F5F7F8]">
              <Image size={16} className="text-[#4A7A8C]" />
              <span>{imageFile ? 'Replace image' : 'Add image'}</span>
              <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="sr-only" />
            </label>
            <span className="inline-flex items-center gap-1 text-[11px] text-[#4A7A8C]"><Camera size={14} />Device or camera</span>
            {imageFile && <button type="button" onClick={() => setImageFile(null)} className="inline-flex h-10 items-center gap-1 rounded-xl px-2.5 text-xs font-semibold text-[#4A7A8C] hover:bg-[#D1E0E3]" aria-label="Remove image"><X size={15} />Remove</button>}
          </div>
          {imageFile && <p className="mt-2 max-w-[18rem] truncate text-[11px] text-[#4A7A8C]">{imageFile.name}</p>}
          {!imageFile && <p className="mt-2 text-[10px] text-[#4A7A8C]">JPG, PNG, or HEIC up to 6 MB</p>}
        </div>
        <button type="submit" disabled={!content.trim() || posting} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#4A7A8C] px-5 text-sm font-bold text-[#F5F7F8] transition hover:bg-[#2E3B42] disabled:cursor-not-allowed disabled:opacity-50"><Send size={16} />{posting ? 'Posting...' : 'Post'}</button>
      </div>
      {uploadError && <p role="alert" className="mt-3 rounded-xl bg-[#D1E0E3] px-3 py-2 text-xs font-semibold text-[#2E3B42]">{uploadError}</p>}
      {previewUrl && <div className="relative mt-4 h-44 overflow-hidden rounded-xl border border-[#D1E0E3] bg-[#D1E0E3] sm:h-52"><img src={previewUrl} alt="Preview of your post" className="h-full w-full object-contain" /><span className="absolute bottom-3 left-3 rounded-full bg-[#2E3B42] px-3 py-1 text-[11px] font-semibold text-[#F5F7F8]">Preview</span></div>}
    </form>
  )
}