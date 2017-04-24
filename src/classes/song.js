exports.Song = function(data, path, source) {
    this.artist = data.artist || 'Unknown Artist';
    this.album = data.album || 'Unknown Album';
    this.title = data.title || 'Unknown Title';
    this.track = parseInt(data.track) || 0;
    this.source = source;
    this.song_id = data.song_id;
    this.preview_url = data.preview_url;
    this.duration = data.duration;

    var image = data.picture;
    console.log(source);
    if(image && source == 'local') {
        var base64String = "";
        for (var i = 0; i < image.data.length; i++) {
            base64String += String.fromCharCode(image.data[i]);
        }
        var base64 = "data:" + image.format + ";base64," +
                window.btoa(base64String);
        this.picture = base64;
    }
    else if((image && source === 'spotify') || (image && source === 'youtube')){
        this.picture = path;
    }
    else {
        this.picture = './resources/images/albumPlaceHolder.png';
    }
    // this.number = data.track.no;
    // this.albumImg = data.picture[0].data;
    // this.albumImgExtension = data.picture[0].format;

    this.path = path;
}