import React, {useState} from 'react';
import axios, { AxiosResponse } from 'axios';
import './App.css';

type Data = { class: string }[];

function App() {
  const [selectedImage, setSelectedImage] = useState<Array<{
    files: File | null,
    id: number
  }> | null>(null)

  const [imageCount, setImageCount] = useState<number>(1)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [data, setData] = useState<Data | null>(null);
  const [isError, setIsError] = useState<boolean>(false)

  const onImageChange = ({currentTarget: {files}}: React.ChangeEvent<HTMLInputElement>, index: number) => {
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
  }

  const doClassification = () => {
    const formData = new FormData()

    selectedImage?.forEach(image => {
      if (image.files !== null) {
        formData.append("files", image.files)
      }
    })

    axios.post("http://localhost:8000/predict", formData)
      .then((response) => {
        setIsLoading(true)
        setData(response.data)
      })
      .catch((err) => console.log(err));
  }

  const addImageCount = () => {
    setImageCount(imageCount + 1)
  }

  return (
    <div className='wrapper'>
      <div className='container'>
        <p>Selamat datang di aplikasi klasifikasi Rambu Lalu Lintas</p>
        <p>
          Tujuan Penelitian : 
        </p>
          <div className='list-item-wrapper'>
            <ol>
              <li>Menguji akurasi dan kecepatan dalam pengenalan rambu lalu lintas dengan metode ekstraksi 
                fitur yaitu Histogram Projection dan Local Binary Pattern serta penggunaan metode Random
                Forest pada saat klasifikasi.</li>
              <li>Menguji akurasi dan kecepatan pengenalan rambu lalu lintas dengan ekstraksi
                fitur lain dan menggunakan metode Random Forest pada saat klasifikasi.</li>
              <li>Apakah Histogram Projection dan Local Binary Pattern berpengaruh terhadap 
                akurasi Random Forest?</li>
            </ol>
          </div>
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
                  {data !== null && (
                    <span>Hasil Klasifikasi : {data?.[i]?.class === undefined ? 'Belum Dilakukan Klasifikasi' : data?.[i]?.class}</span>
                  )}
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
        <button onClick={doClassification} className='classify' disabled={selectedImage?.[0] === undefined}>
          {selectedImage?.[0] === undefined ? 'Masukkan minimal 1 gambar' : 'Lakukan Klasifikasi'}
        </button>
      </div>
    </div>
  );
}

export default App;
