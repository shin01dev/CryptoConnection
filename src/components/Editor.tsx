'use client'

import EditorJS from '@editorjs/editorjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import TextareaAutosize from 'react-textarea-autosize'
import { z } from 'zod'
import { BASE_URL } from './BASE_URL'
import CustomCodeRenderer from '@/components/renderers/CustomCodeRenderer'
import CustomImageRenderer from '@/components/renderers/CustomImageRenderer'
import { toast } from '@/hooks/use-toast'
import { uploadFiles } from '@/lib/uploadthing'
import { PostCreationRequest, PostValidator } from '@/lib/validators/post'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import React from 'react';
import "@uploadthing/react/styles.css";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from '@/app/api/uploadthing/core'


import '@/styles/editor.css'
import { encode } from 'punycode'

type FormData = z.infer<typeof PostValidator>

interface EditorProps {
  subredditId: string
  content?: any // 여기에 알맞은 타입을 넣어주세요.
  title?: any // 여기에 알맞은 타입을 넣어주세요.
  postId?: string // postId를 props로 추가
  editThumbnail?: string | null | undefined;  // 추가
  // donateCoin?: string ; // 추가됨
  donateTo?: string ; // 추가됨
}

export const Editor: React.FC<EditorProps> = ({ subredditId, content ,title, postId,editThumbnail,donateTo}) => {
  const [currentURL, setCurrentURL] = useState('');
  useEffect(() => {
    setCurrentURL(window.location.href);
  }, []);
  const [imageUrl, setImageUrl] = useState<string | null>(editThumbnail ||"/logo2.png"); // editThumbnail로 초기화
  const [coinNumber, setCoinNumber] = useState<number | null>(0);
  const [warning, setWarning] = useState<string | null>(null);
  const [donateCoin, setdonateCoin] = useState("1");

  const isMyFeed = currentURL.includes('/r/myFeed/');

  useEffect(() => {
    if (isMyFeed) {
      setdonateCoin("1");
    } else {
      setdonateCoin("0");
    }
  }, [isMyFeed]);

  async function getCoinNumber() {
    // Assume we get the coin number from an API
    const response = await axios.get('/api/getCoinNumber');
    
    // Get the first object from the response data array
    const firstObject = response.data[0];
  
    // Log the crypto_currency value
    // console.log("COIN: " + firstObject.crypto_currency);
    
    setCoinNumber(firstObject.crypto_currency);  // Setting the state with the fetched value
  }
  useEffect(() => {
    getCoinNumber();
})


// 1. 상태 변수 추가
const [maxCoinValue, setMaxCoinValue] = useState<number | null>(null);
useEffect(() => {
  async function getCoinNumber() {
    try {
      // Assume we get the coin number from an API
      const response = await axios.get('/api/getCoinNumber');
      // Get the first object from the response data array
      const firstObject = response.data[0];
      // Log the crypto_currency value

      // 1. 값을 상태 변수에 저장
      setMaxCoinValue(firstObject.crypto_currency);
    } catch (error) {
      console.error("Error fetching coin number:", error);
    }
  }

  getCoinNumber();  // 페이지가 로드될 때 함수를 호출합니다.
}, []);  // 빈 dependency array는 이 useEffect를 컴포넌트가 마운트될 때 딱 한 번만 실행되게 합니다.


async function subscribeToSubreddit(subredditId: string) {
  const apiUrl = '/api/subreddit/subscribe'; // 이 부분에 해당 API의 엔드포인트 주소를 적어주세요.

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 아래 헤더는 필요에 따라 추가하거나 수정해야 할 수도 있습니다.
        // 예를 들어, 인증 토큰이 필요하면 'Authorization': `Bearer ${token}`과 같이 추가할 수 있습니다.
      },
      body: JSON.stringify({ subredditId }),
    });

    if (response.ok) {
      const responseBody = await response.text();
    } else {
      const error = await response.text();
      console.error(`Failed to subscribe: ${error}`);
    }
  } catch (error) {
    console.error('Error occurred while subscribing to subreddit:', error);
  }
}


useEffect(() => {
  if (window.location.href.includes('donate')) {
    subscribeToSubreddit('cllz0gqww00043n6w9da8k6vb');
  }

  return () => {};
}, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(PostValidator),
    defaultValues: {
      subredditId,
      // 여기가 제목 입력하는 부분
      title: title,
      content: null,
      donateCoin:donateCoin,
      donateTo:donateTo
      
    },
  })
    const renderers = {
    image: CustomImageRenderer,
    code: CustomCodeRenderer,
  }

  const style = {
    paragraph: {
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
    },
  }
  const ref = useRef<EditorJS>()
  const _titleRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const [isMounted, setIsMounted] = useState<boolean>(false)
  const pathname = usePathname()


  const { mutate: createPost } = useMutation({
    mutationFn: async ({
      title,
      content,
      subredditId,
      postId,
      thumbnail,
      editThumbnail,
      donateCoin,
      donateTo,
    }: PostCreationRequest) => {
      const payload: PostCreationRequest = { title, content, subredditId ,postId,thumbnail,editThumbnail,donateCoin,donateTo}
     
      // currentURL이 /edit/를 포함하는지 확인
      const isEditing = currentURL.includes('/edit/')
  
      const apiUrl = isEditing ? '/api/subreddit/post/update' : '/api/subreddit/post/create'
  
      const { data } = await axios.post(apiUrl, payload)
  
      return data
    
    },
    onError: () => {
      return toast({
        title: 'Something went wrong.',
        description: 'Your post was not published. Please try again.',
        variant: 'destructive',
      })
    },
    onSuccess: () => {
      // turn pathname /r/mycommunity/submit into /r/mycommunity
      const isEditing = pathname.includes('/edit/')
      const newPathname = isEditing ? pathname.split('/').slice(0, -2).join('/') : pathname.split('/').slice(0, -1).join('/')
      const segments = pathname.split('/');
      const secondLastSegment = segments[segments.length - 2];
      
   
      if (pathname.includes('donate')) {
        // If it does, modify the newPathname to include "/donate" at the end
        window.location.href = `/r/donation/${secondLastSegment}`;
        
      } else {
        window.location.href = newPathname;
      }
      return toast({
        description: '글이 성공적으로 작성 되었습니다.',


      })

    },
    
  })

  const initializeEditor = useCallback(async () => {
    const EditorJS = (await import('@editorjs/editorjs')).default
    const Header = (await import('@editorjs/header')).default
    const Embed = (await import('@editorjs/embed')).default
    const Table = (await import('@editorjs/table')).default
    const List = (await import('@editorjs/list')).default
    const Code = (await import('@editorjs/code')).default
    const LinkTool = (await import('@editorjs/link')).default
    const InlineCode = (await import('@editorjs/inline-code')).default
    const ImageTool = (await import('@editorjs/image')).default

    if (!ref.current) {
      const editor = new EditorJS({
        holder: 'editor',
        onReady() {
          ref.current = editor
        },
        placeholder: 'Type here to write your post...',
        inlineToolbar: true,





// __________________________________________________________________________________________데이터// __________________________________________________________________________________________데이터

        
        data: content || { blocks: [
          {
            type: 'paragraph',
            data: {
              text: '',
              // 이 부분이 본문 내용 추가 하는 부분
            },},
        ] },
        
        tools: {
          header: Header,
          linkTool: {
            class: LinkTool,
            config: {
              endpoint: '/api/link',
            },
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  // Get the original file's extension
                  const fileExtension = file.name.split(".").pop();
                  
                  // Upload to uploadthing
                  const encodedName = encodeURIComponent(file.name);
                  const cleanName = encodedName.replace(/[^a-zA-Z0-9]/g, "");
                
                  // Add the original extension to the cleaned file name
                  const newFileName = `${cleanName}.${fileExtension}`;
                
                  const newFile = new File([file], newFileName, { type: file.type });
                
                
                  const [res] = await uploadFiles([newFile], 'imageUploader')
                
                  return {
                    success: 1,
                    file: {
                      url: res.fileUrl,
                    },
                  }
                },
              },
            },
          },
          list: List,
          code: Code,
          inlineCode: InlineCode,
          table: Table,
          embed: Embed,
        },
      })
    }
  }, [content])


// __________________________________________________________________________________________데이터// __________________________________________________________________________________________데이터













  
  useEffect(() => {
    if (Object.keys(errors).length) {
      for (const [_key, value] of Object.entries(errors)) {
        value
        toast({
          title: 'Something went wrong.',
          description: (value as { message: string }).message,
          variant: 'destructive',
        })
      }
    }
  }, [errors])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMounted(true)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      await initializeEditor()

      setTimeout(() => {
        _titleRef?.current?.focus()
      }, 0)
    }

    if (isMounted) {
      init()

      return () => {
        ref.current?.destroy()
        ref.current = undefined
      }
    }
  }, [isMounted, initializeEditor])

  async function onSubmit(data: FormData) {
    const blocks = await ref.current?.save()

    const payload: PostCreationRequest = {
      title: data.title,
      content: blocks,
      subredditId,
      postId,
      thumbnail: imageUrl,  // imageUrl 상태를 thumbnail로 추가
      editThumbnail: imageUrl,  // imageUrl 상태를 editThumbnail로 추가

      donateCoin: donateCoin,
      donateTo: data.donateTo
  }

    createPost(payload)
  }

  if (!isMounted) {
    return null
  }


   // 이미지 업로드 완료 후 URL 저장
   const handleUploadComplete = async (res: any) => {
    if(res) {
      setImageUrl(res[0].fileUrl);
      const result = await fetch(`/api/subreddit/post/create`, {  // API 엔드포인트가 실제로 존재하는지 확인해야 합니다
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: res[0].fileUrl }),
      });
      // 에러 처리 등을 추가해야 합니다
    }
    alert("Upload Completed");
  }





  const { ref: titleRef, ...rest } = register('title')

  return (
    <div className='w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200'>
      
      <form
        id='subreddit-post-form'
        className='w-fit'
        onSubmit={handleSubmit(onSubmit)}>
        <div className='prose prose-stone dark:prose-invert'>
          
          <TextareaAutosize
            ref={(e) => {
              titleRef(e)
              // @ts-ignore
              _titleRef.current = e
            }}
            {...rest}
            placeholder='Title'
            className='w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none'
          />
          <div id='editor' className='min-h-[500px]' />
          <p className='text-sm text-gray-500'>
            Use{' '}
            <kbd className='rounded-md border bg-muted px-1 text-xs uppercase'>
              Tab
            </kbd>{' '}
            to open the command menu.
          </p>
        </div>
      </form>

{/* 썸네일 */}{/* 썸네일 */}{/* 썸네일 */}{/* 썸네일 */}
<main className="flex min-h-screen flex-col items-center justify-between p-24">
  <UploadButton<OurFileRouter>
    endpoint="imageUploader"
    onClientUploadComplete={handleUploadComplete}
    onUploadError={(error: Error) => {
      // Do something with the error.
      alert(`ERROR! ${error.message}`);
    }}
  />
      {imageUrl && <img src={imageUrl} alt="Uploaded file" />}
</main>
<div>

{coinNumber && coinNumber >= 1 ? (
    <>
    {isMyFeed && (
      <>
        <input 
          type="range"
          min={1}
          max={coinNumber}
          step="1"
          value={donateCoin}
          onChange={(e) => {
              const inputValue = e.target.value;
              setdonateCoin(inputValue); // Note: corrected the function name to use camelCase
          }}
          className="w-full p-2 border border-gray-300 rounded mt-4"
        />
        <div className="text-center mt-2">
            후원 토큰 금액: {donateCoin}
        </div>
      </>
    )}
    </>
) : null}
        </div>
{warning && <p className="text-red-500 mt-2">{warning}</p>}


{/* 썸네일 */}{/* 썸네일 */}{/* 썸네일 */}{/* 썸네일 */}




    </div>
    
  )
}
