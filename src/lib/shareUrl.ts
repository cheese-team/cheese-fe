type ShareOptions = {
  title: string;
  url: string;
};

export async function shareUrl({ title, url }: ShareOptions) {
  try {
    if (navigator.share) {
      await navigator.share({ title, url });
      return;
    }

    await navigator.clipboard.writeText(url);
    alert('링크가 복사되었습니다.');
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return;
    }

    console.error('공유에 실패했습니다.', error);
    alert('공유에 실패했습니다. 다시 시도해 주세요.');
  }
}
