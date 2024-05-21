const textInput = document.querySelector(".text-input")
const submitButton = document.querySelector(".submit")
const imageframe = document.querySelector(".image-frame")
const generatedText = document.querySelector(".generated-text");

submitButton.addEventListener("click", async () => {
    let inputValue = textInput.value;
    if(inputValue != ""){
        //issue query
		let blob = await getImage({"inputs": inputValue});
		const blobUrl = URL.createObjectURL(blob);
		imageframe.src = blobUrl;
		let base64 = await toBase64(blob);
		let publicURL = await uploadFile(base64);
		let desc = await getImageDescription(publicURL);

		generatedText.innerHTML = desc[0].generated_text;
    }
});

async function getImage(data) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
		{
			headers: { Authorization: "Bearer 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",
            "Content-Type": "application/json"
        },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.blob();
	return result;
}

export function uploadFile(file) {
	return new Promise((resolve, reject) => {
		const url = `https://api.cloudinary.com/v1_1/dmm8zr0az/upload`
		const fd = new FormData();
		fd.append('upload_preset', 'jb97dxcc');
		fd.append('file', file);

		fetch(url, {
			method: 'POST',
			body: fd,
		})
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			let url = data.secure_url;
			resolve(url)
		})
	})
}

export async function toBase64(blobURL){
	return new Promise((resolve, reject) => {
	  const reader = new FileReader();
	  reader.onloadend = function () {
		  const base64 = reader.result;
		  resolve(base64);
	  };
	  reader.onerror = function (error) {
		  reject(error);
	  };
	  reader.readAsDataURL(blobURL);
  });
  }

  async function getImageDescription(image) {

	const response = await fetch(
		"https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large",
		{
			headers: { Authorization: "Bearer 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",
				"Content-Type": "application/json"
		},
			method: "POST",
			body: image,
		}
	);
	const result = await response.json();
	return result;
}