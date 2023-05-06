import React, {useState} from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [selectedImage, setSelectedImage] = useState<Array<{
    files: File | null,
    id: number
  }> | null>(null)

  const [imageCount, setImageCount] = useState<number>(1)

  const onImageChange = ({currentTarget: {files}}: React.ChangeEvent<HTMLInputElement>, index: number) => {
    console.log("index", index)
    console.log("files", files)
    if (files && files.length) {
      const image = {
        id: index,
        files: files[0]
      }

      setSelectedImage(existingImages => {
        if (existingImages === null) {
          // Initialize selectedImage as an empty array
          return [image];
        } else {
          // Append the new image to the existing images
          return [...existingImages, image];
        }
      });
    }

    console.log("selectedImage", selectedImage)
  }

  const doClassification = () => {
    // setSelectedImage(null)
    console.log("Aaaa")
  }

  const addImageCount = () => {
    setImageCount(imageCount + 1)
  }

  return (
    <>
    <div className='container'>
      <p>Welcome to Traffic sign image classification</p>
    </div>
    <div className='image--box'>
    {[...Array(imageCount)].map((e, i) => 
      <div className='center'>
        <div className='form-input'>
          <div className='preview'>
            <input type="file" accept="image/*" onChange={(e) => onImageChange(e, i)} className='custom-file-input' /> 
            {selectedImage?.[i] && (
              <div className='preview'>
                <img 
                  src={selectedImage?.[i]?.files !== null ? URL.createObjectURL(selectedImage[i].files as File) : 'default-image'}
                  className='image'
                  alt='Traffic sign image'
                />
                {/* <button onClick={removeSelectedImage} className='delete'>
                  Hapus
                </button> */}
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </div>
    <div className='button-wrapper'>
      <button onClick={addImageCount} className='add'>
        Tambah
      </button>
      <button onClick={doClassification} className='classify'>
        Lakukan Klasifikasi
      </button>
    </div>
    </>
  );
}

export default App;
