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
weight = rand(70*60 + 1, 1);
learningRate = 0.1;
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
writematrix(weight, "perceptronWeights.csv");
%% test perceptron
weight = csvread("perceptronWeights.csv");
faceValidationFile = fopen("facedata/facedatavalidation", "r");
faceValidationLabelFile = fopen("facedata/facedatavalidationlabels", "r");
validationLabels = fscanf(faceValidationLabelFile, "%d");
line = fgetl(faceValidationFile)
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
    line = fgetl(faceValidationFile);
end

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