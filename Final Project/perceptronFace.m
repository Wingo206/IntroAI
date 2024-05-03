%% load data 
faceTrainingFile = fopen("facedata/facedatatrain", "r");
faceTrainingLabelsFile = fopen("facedata/facedatatrainlabels", "r");
labels = fscanf(faceTrainingLabelsFile, "%d");
line = fgetl(faceTrainingFile)
faceImagesArray = zeros(70,60,451);
imageCounter = 1;
increment = 1;
currentFaceImage = zeros(70,60);

while(ischar(line))
    currentFaceImage(increment,:) = (line == 43) + 2*(line == 35);
    increment = increment + 1;
    if (increment > 70)
        faceImagesArray(:,:,imageCounter) = currentFaceImage;
        imageCounter = imageCounter + 1;
        increment = 1;
        currentFaceImage = zeros(70,60);
    end
    line = fgetl(faceTrainingFile);
end
%% train perceptron 
%weight = zeros(70*60 + 1, 1);
%100A, learningrate 1, 0.8738 
%100B, learningrate 0.1, 0.8771
%100C, learningrate 10, 0.8870
weight = rand(70*60 + 1, 1);
learningRate = 10;
changeMade = true;
counter = 0;

while (changeMade == true)
   changeMade = false;
   counter = 0;
   disp("hi:");
   for i = 1 : 451
       predictions = zeros(1,1);
       currentImage = ones(70*60 + 1, 1);
       currentImage(2:end) = reshape(faceImagesArray(:,:,i), [70*60,1]);
       z = currentImage .* weight;
       predictions = sum(z);
       currentLabel = zeros(1, 1);
       currentLabel = labels(i);
       normalizedPredictions = predictions > 0;
       adjustedMask = currentLabel - normalizedPredictions;
       adjustedMask = repmat(adjustedMask, [70*60+1,1]);
       weight = weight + learningRate * adjustedMask .* currentImage;
       currentChangeMade = sum(abs(adjustedMask), "all") > 0;
       changeMade = changeMade || currentChangeMade;
       counter = counter + currentChangeMade;
   end 
      disp(counter);
end
writematrix(weight, "perceptronWeightsFace100C.csv");
%% test perceptron
weight = csvread("perceptronWeightsFace100C.csv");
faceValidationFile = fopen("facedata/facedatavalidation", "r");
faceValidationLabelFile = fopen("facedata/facedatavalidationlabels", "r");
faceTestFile = fopen("facedata/facedatatest", "r");
faceTestLabelFile = fopen("facedata/facedatatestlabels", "r");

[faceImagesArray, validationLabels] = imageFileToMatrix(faceValidationFile, faceValidationLabelFile);
[faceImagesArray2, validationLabels2] = imageFileToMatrix(faceTestFile, faceTestLabelFile);

results = zeros(1,301);

for i = 1 : 301
       predictions = zeros(1,1);
       currentImage = ones(70*60 + 1, 1);
       currentImage(2:end) = reshape(faceImagesArray(:,:,i), [70*60,1]);
       z = currentImage .* weight;
       predictions = sum(z);
       normalizedPredictions = predictions > 0;
       results(i) = validationLabels(i) == normalizedPredictions;
end
accuracy = mean(results)

[predicted, real] = singleTest(faceImagesArray2, weight, validationLabels2, 1)

function [predicted, real] = singleTest(faceImagesArray, weight, validationLabels, image)
       predictions = zeros(1,1);
       currentImage = ones(70*60 + 1, 1);
       currentImage(2:end) = reshape(faceImagesArray(:,:,image), [70*60,1]);
       z = currentImage .* weight;
       predictions = sum(z);
       predicted = predictions > 0;
       real = validationLabels(image);
end

function [outputArray, validationLabels] = imageFileToMatrix(testingFileImage, testingFileLabels)
   line = fgetl(testingFileImage)
   faceImagesArray = zeros(70,60,301);
   imageCounter = 1;
   increment = 1;
   currentFaceImage = zeros(70,60);
    while(ischar(line))
        currentFaceImage(increment,:) = (line == 43) + 2*(line == 35);
        increment = increment + 1;
        if (increment > 70)
            faceImagesArray(:,:,imageCounter) = currentFaceImage;
            imageCounter = imageCounter + 1;
            increment = 1;
            currentFaceImage = zeros(70,60);
        end
        line = fgetl(testingFileImage);
    end
    outputArray = faceImagesArray;
    validationLabels = fscanf(testingFileLabels, "%d");
end