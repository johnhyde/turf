import { createEffect, onCleanup } from 'solid-js';
import { processImageFiles } from 'lib/utils.js';
import SmallButton from '@/SmallButton.jsx';

export default function UploadButton(props) {
  createEffect(() => {
    if (props.key) clearUpload();
  });

  onCleanup(() => {
    clearUpload();
  });

  async function uploadFiles(e) {
    const [frames, errors] = await processImageFiles(e.target.files);
    if (frames.length) {
      props.onFrames?.(frames);
      props.onFrame?.(frames[0]);
    }
    if (errors.length) {
      props.onErrors?.(errors);
    }
    clearUpload();
  }

  function clearUpload() {
    if (uploader) uploader.value = '';
  }

  let uploader;
  return (
    <>
      <SmallButton onClick={() => uploader.click()}>
        {props.label || 'Upload'}
      </SmallButton>
      <input
        type='file'
        accept='image/*'
        multiple={props.multiple}
        onInput={uploadFiles}
        ref={uploader}
        class='hidden'
      />
    </>
  );
}
