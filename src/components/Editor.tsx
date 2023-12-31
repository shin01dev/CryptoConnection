'use client'

import EditorJS from '@editorjs/editorjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import TextareaAutosize from 'react-textarea-autosize'
import { z } from 'zod';
import { BASE_URL } from './BASE_URL'
import CustomCodeRenderer from '@/components/renderers/CustomCodeRenderer'
import CustomImageRenderer from '@/components/renderers/CustomImageRenderer'
import { toast } from '@/hooks/use-toast'
import { uploadFiles } from '@/lib/uploadthing'
import { uploadFiles as videoFile } from '@/lib/uploadthingvideo'
import { PostCreationRequest, PostValidator } from '@/lib/validators/post'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import React from 'react';
import "@uploadthing/react/styles.css";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from '@/app/api/uploadthing/core'
import VideoTool from '@weekwood/editorjs-video';
import { v4 as uuidv4 } from 'uuid';
import imageCompression from 'browser-image-compression';
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { DANGEROUS__uploadFiles } from "uploadthing/client"; // 라이브러리에서 제공하는 업로드 함수.

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
  const [imageUrl, setImageUrl] = useState<string | null>(editThumbnail ||""); // editThumbnail로 초기화
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
    subscribeToSubreddit('cln2rd2hw0006squwqb8ox0sf');
  }

  // return () => {};
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


  
  const [isMutationCalled, setIsMutationCalled] = useState(false);

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
    
      if (isMutationCalled) return; // 이미 뮤테이션이 호출된 경우 추가 호출 방지
      setIsMutationCalled(true);

  

      const payload: PostCreationRequest = { title, content, subredditId ,postId,thumbnail,editThumbnail,donateCoin,donateTo}
     
      // currentURL이 /edit/를 포함하는지 확인
      const isEditing = currentURL.includes('/edit/')
  
      const apiUrl = isEditing ? '/api/subreddit/post/update' : '/api/subreddit/post/create'
  
      const { data } = await axios.post(apiUrl, payload)
  
      return data
    
    },
    onError: () => {
      setIsMutationCalled(false);

      return toast({
        title: '게시물 생성 실패.',
        description: '커뮤니티 그룹에 가입 후 다시 시도해 주세요.',
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
        if (typeof window !== 'undefined') {
          window.location.href = `/r/donation/${secondLastSegment}`;
        }
        
        // router.push(`/r/donation/${secondLastSegment}`)

        // router.refresh()
        
  
      } else {
        if (typeof window !== 'undefined') {
          window.location.href = newPathname;
        }        // router.push(newPathname)
        // router.refresh()

      }


      return toast({
        description: '글이 성공적으로 작성 되었습니다.',


      })

    },
    
  })
       const ffmpeg = createFFmpeg({
        log: true,
      });
  
  async function compressVideo(file:any) {
    try {
 
      if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
      }
  
      // 원본 파일을 메모리에 작성합니다.
      ffmpeg.FS('writeFile', file.name, new Uint8Array(await file.arrayBuffer()));
  
      // 압축 명령 실행. 여기서 CRF 값을 28로 설정합니다.
      await ffmpeg.run(
        '-i',
        file.name,
        '-c:v',
        'libx264', // 비디오 코덱 설정
        '-preset',
        'superfast', // 인코딩 속도와 압축률 사이의 밸런스 설정. 'superfast'는 좋은 속도를 제공합니다.
        '-crf',
        '28', // 품질 설정. 18-28은 대부분의 경우에 적합합니다. 값이 높을수록 품질이 낮아지고 파일 크기가 작아집니다.
        '-vf',
        'scale=-2:720', // 해상도 조정. 높이를 720p로 설정하고 비율은 유지합니다.
        '-c:a',
        'aac', // 오디오 코덱 설정. 대부분의 경우에 적합합니다.
        '-strict',
        'experimental', // 일부 오래된 FFmpeg 버전에서 필요한 옵션.
        '-b:a',
        '128k', // 오디오 비트레이트 설정. 대부분의 사용에 적합한 값입니다.
        'output.mp4' // 출력 파일 이름
      );
  
      // 압축된 파일을 메모리에서 읽습니다.
      const compressedFile = ffmpeg.FS('readFile', 'output.mp4');
  
      // 메모리에서 원본 파일을 삭제합니다.
      ffmpeg.FS('unlink', file.name);
  
      // Blob을 File 객체로 변환하여 파일의 원래 이름을 유지하고, MIME type도 설정합니다.
      const compressedBlob = new Blob([compressedFile.buffer], { type: 'video/mp4' });
      const fileName = file.name; // 원본 파일 이름을 유지할 수도 있고, 필요에 따라 변경할 수도 있습니다.
      const compressedVideoFile = new File([compressedBlob], fileName, { type: 'video/mp4' });
  
      return compressedVideoFile; // 압축된 비디오 파일을 반환합니다.
    } catch (error) {
      console.error('Video compression error:', error); // 오류를 콘솔에 기록합니다.
      // 필요에 따라 사용자에게 오류 메시지를 표시할 수 있습니다.
      // 예: alert('비디오를 압축하는 동안 오류가 발생했습니다. 다시 시도해주세요.');
      throw error; // 오류를 다시 throw하여 이 함수를 호출하는 코드에서 처리할 수 있도록 합니다.
    }
  }
  

  
  async function compressFile(file:any) {
    const options = {
      maxSizeMB: 1, // 이전보다 큰 파일 크기 제한을 설정하여 품질 손실을 줄입니다.
      maxWidthOrHeight: 1920, // 더 높은 해상도를 유지하여 이미지/비디오의 선명도를 보존합니다.
      useWebWorker: true, // 웹 워커를 사용하여 메인 스레드에서 압축 프로세스를 비동기적으로 처리합니다.
    };
    
    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("파일 압축 중 오류 발생: ", error);
      return file; // 압축에 실패한 경우 원본 파일 반환
    }
  }

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
        placeholder: '여기에 글을 작성 하세요 !',
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
                  const compressedFile = await compressFile(file);

                  // Get the original file's extension
                  const fileExtension = compressedFile.name.split(".").pop();
                  
                  // Upload to uploadthing
                  const encodedName = encodeURIComponent(compressedFile.name);
                  const cleanName = encodedName.replace(/[^a-zA-Z0-9]/g, "");
                
                  // Add the original extension to the cleaned file name
                  const newFileName = `${cleanName}.${fileExtension}`;
                
                  const newFile = new File([compressedFile], newFileName, { type: compressedFile.type });
                
                
                  const [res] = await uploadFiles([newFile], 'mediaPost')
                
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
          embed: Embed,

      video: {
  class: VideoTool,
  config: {
    uploader: {
      // video 파일 업로드 로직
      async uploadByFile(file: File) {
        // const compressedFile = await compressVideo(file);
        // Get the original file's extension
        const fileExtension = file.name.split(".").pop();
        
        // Encode and clean the file name
        const encodedName = encodeURIComponent(file.name);
        const cleanName = encodedName.replace(/[^a-zA-Z0-9]/g, "");
      
        // Add the original extension to the cleaned file name
        const newFileName = `${cleanName}.${fileExtension}`;
      
        const newFile = new File([file], newFileName, { type: file.type });
      
      
        const [res] = await videoFile([newFile], 'mediaPost') // video 업로드를 위한 엔드포인트
      
        return {
          success: 1,
          file: {
            url: res.fileUrl,
          },
        }
      },
    },
    player: {
      controls: true,
      autoplay: false
    }
    
  }
},

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
          title: '다시 시도해 주세요.',
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

      donateCoin: donateCoin,
      donateTo: data.donateTo
  }
//
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
            placeholder='제목'
            className='w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none'
          />
          <div id='editor' className='min-h-[500px]' />
          <p className='text-sm text-gray-500'>
            커맨더 기능 사용을 위해{' '}
            <kbd className='rounded-md border bg-muted px-1 text-xs uppercase'>
              Tab
            </kbd>{' '}
            버튼을 눌러 주세요.
          </p>
          <p className='text-sm text-gray-600'>
          동영상 파일은 최대 32MB , 사진 파일은 최대 16MB 업로드 가능합니다.
          </p>
          <p className='text-sm text-gray-600'>
  
          </p>

        </div>
      </form>

{/* 썸네일 */}{/* 썸네일 */}{/* 썸네일 */}{/* 썸네일 */}
<main className="flex min-h-screen flex-col items-center justify-between p-24">
  <UploadButton<OurFileRouter>
    endpoint="ThumbnailPost"
    onClientUploadComplete={handleUploadComplete}
    onUploadError={(error: Error) => {
      // Do something with the error.
      alert(`ERROR! ${error.message}`);
    }}
    
  />
      {imageUrl && <img src={imageUrl} alt="Uploaded file" />}
</main>
{/* 썸네일 */}{/* 썸네일 */}{/* 썸네일 */}{/* 썸네일 */}

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






    </div>
    
  )
}