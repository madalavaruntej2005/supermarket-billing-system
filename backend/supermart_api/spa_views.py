from pathlib import Path
from django.http import HttpResponse, FileResponse, Http404
from django.conf import settings

def serve_spa(request, path=''):
    """
    Serves the React frontend single-page application (SPA).
    If a specific file in frontend/dist exists, it serves that file;
    otherwise, it serves index.html to allow React Router to handle client-side routes.
    """
    dist_dir = settings.BASE_DIR.parent / 'frontend' / 'dist'
    index_file = dist_dir / 'index.html'

    if path:
        file_path = dist_dir / path
        if file_path.exists() and file_path.is_file():
            return FileResponse(open(file_path, 'rb'))

    if index_file.exists():
        with open(index_file, 'r', encoding='utf-8') as f:
            return HttpResponse(f.read(), content_type='text/html')

    return HttpResponse(
        "<h3>SuperMart Frontend build not found.</h3><p>Please run <code>npm run build</code> inside the frontend folder.</p>",
        status=404,
        content_type='text/html'
    )
