/*
This Script is a JavaScript used for PHOTOSHOP purpose.
Created by Florent Tainturier

This script is based on work of :
 - Mike Voropaev - https://www.youtube.com/watch?v=IXFSPbOjYrY&t=1465s
 - JJMack http://www.mouseprints.net/old/dpr/PlaceWatermark.jsx 

Purpose of the script
To perform batch post-processing of pictures.
The post-processing relies on a Photoshop action, whereas the script is in charge of :
 1 - managing the log
    Creation of a subfolder for the Log
    Creation of a log append function to factorise the code

 2 - managing the batch of files based on a Select Dialog Box on custom Folder.
    Dialog box to open the right folder,
    Definition of an output folder to store the post-treated images
    Renaming of the images

Details of the post-processing : (based on Photoshop action)
 1 - With Select/Color range function : try to select all the Green cast (with invert parameter)
 2 - Apply a Mask on the layer. The mask is based on the Color range output
 3 - Add a new Layer with the Watermark Logo : the inserted image is resised and moved to the right position
 4 - Add a new text layer as Watermark to add additionnal information
 5 - Add a new Layer as the main Background (which is revealed thanks to the mask of the layer)

*/
(function main(){
    app.preferences.rulerUnits = Units.PIXELS;

    // The first Dialog box to get the images to be post-processed
    var targetPath = Folder.selectDialog('Select folder with target render elements');

    // Creation of the folder for the log information, based on the main folder + Management of the file presence.
    var outLogFolder = new Folder(targetPath + '/scriptlogs');
    if(!outLogFolder.exists) outLogFolder.create();
    var logFile = new File(outLogFolder + '/log.txt');
    logFile.encoding = 'UTF8';
    if (logFile.exists)
	    logFile.remove();

    logFile.open('w');

    // Creation of a table with all the files with .jpg extension in the folder    
    var tempFiles = targetPath.getFiles(/.jpg/i);

    // Management of error for the loop
    if (tempFiles.length > 0){
        appendLog('Files found. Starting postproduction', logFile);
        
        // Creation of the folder for the output rendering
        var outputFolder = new Folder(targetPath + '/_generated');
        if(!outputFolder.exists) outputFolder.create();
    
        // Main Loop for the batch processing.
        for (var i = 0; i < tempFiles.length; i++){
            appendLog('_____________________________', logFile);
            appendLog('Found ' + tempFiles[i].name, logFile);
    
            var elementFiles = [];

            app.open(tempFiles[i]);
            var target = app.activeDocument;
            // Try catch structure for error management
            try {
                appendLog('Running action: ' + tempFiles[i], logFile);
                // Call of the MAIN action which is in charge of the graphical post-processing.
                app.doAction('RemoveGreen+Watermark','FTA');
                }
            catch(e){
                appendLog('PROBLEM WITH ACTION / MISSING ACTION ', logFile);
                logFile.close();
                break;
                }
            finally{
                // Renamming of the output files
                //var outputFilename = tempFiles[i].name.substring(0, tempFiles[i].name.toLowerCase().lastIndexOf('.jpg')); // Use this line if you want to keep the original file name.
                var outputFilename = 'APEMLH-JourneeRecreative-' + getCurrentDateFormatted() + '-' + i; // Use this line to rename the rendered file.
                saveJpeg(outputFilename, outputFolder, 12);
                appendLog('Save of: ' + tempFiles[i] + ' as a new file into ' + outputFilename, logFile);
                target.close(SaveOptions.DONOTSAVECHANGES);
            }    
        }
        
    }
    else
    {
        appendLog('Cant find anything to work with!', logFile);
        alert('Cant find anything to work with!');
    }
    
    appendLog('*****************************************************************************',logFile);
    appendLog('*****************************************************************************',logFile);
    appendLog('                  End of the batch post-processing',logFile);
    appendLog('*****************************************************************************',logFile);
    appendLog('*****************************************************************************',logFile);

})();


/**
 * This function if a general Log management function.
 * Its purpose is to make logs homogenous
 * @param  {} message the message to be written
 * @param  {} file where the log is stored
 */
function appendLog(message, file){
	var time = new Date();
    // Format of the time code
	file.write(('0' + time.getHours()).slice(-2) + ':' + ('0' + time.getMinutes()).slice(-2) + ':' + ('0' + time.getSeconds()).slice(-2));
	file.write('  >>>>> ' + message);
	file.writeln('');
}

/**
 * This function as a generic SaveJPEG for Photoshop
 * A small renamming feature is used with the DATE format.
 * @param  {} name The name of the file
 * @param  {} folder The folder where to store the file
 * @param  {} quality The quality factor for the file
 */
function saveJpeg(name, folder, quality){
	var doc = app.activeDocument;
    // File renaming and formating with YYMMDD date code.
	var file = new File(folder + '/' + name + '.jpg');
	var opts = new JPEGSaveOptions();
	opts.quality = quality;
	opts.embedColorProfile = true;
	doc.saveAs(file, opts, true);
}
/**
 * Simple function to format the date
 */
function getCurrentDateFormatted(){
    // Return today's date and time
    var currentTime = new Date();
    // returns the month (from 0 to 11)
    var month = currentTime.getMonth() + 1;
    // returns the day of the month (from 1 to 31)
    var day = currentTime.getDate();
    // returns the year (four digits)
    var year = currentTime.getFullYear();
    // write output YYYYMMDD - please do not forget the '' in the concatenation. If not, the function return is converted as integer.
    var formattedDate = '' + year + month + day;
    return formattedDate;
}
