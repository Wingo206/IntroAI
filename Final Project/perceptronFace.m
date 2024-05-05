%% load data 
[faceImagesArray, labels] = loadTrain(1, 451);
%% train perceptron 
%weight = zeros(70*60 + 1, 1);
%100A, learningrate 1, 0.8738 
%100B, learningrate 0.1, 0.8771
%100C, learningrate 10, 0.8870

totalTrialTimes = zeros(10,1);
totalTrialWeights = zeros(4201,1,10);

for k = 1:10
    disp("PERCENTAGE: " + 0.1*(k));
   [faceImagesArray, labels] = loadTrain((0.1*(k)), 451);
    trialWeights = zeros(4201,1,5);
    trialTimes = zeros(5,1);
    numberOfImages = round(0.1*(k)*451);

for t = 1:5 
    disp("TRIAL: " + (t));
tic;

weight = rand(70*60 + 1, 1);
learningRate = 1;
changeMade = true;
counter = 0;

while (changeMade == true)
   changeMade = false;
   counter = 0;
   disp("hi:");
   for i = 1 : numberOfImages
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
trialTimes(t,1) = toc;
trialWeights(:,:,t) = weight;

end
mean_weight = mean(trialWeights, 3);

totalTrialWeights(:,:,k) = reshape(mean_weight, [4201, 1, 1]);
writematrix(totalTrialWeights(:,:,k), "perceptronWeightsFace" + (0.1*k) + ".csv");
totalTrialTimes(k,1) = mean(trialTimes);

end
%% test perceptron

%change this weight to best one before demo time to show them results 
weight = csvread("perceptronWeightsFace1.csv");
faceValidationFile = fopen("facedata/facedatavalidation", "r");
faceValidationLabelFile = fopen("facedata/facedatavalidationlabels", "r");
faceTestFile = fopen("facedata/facedatatest", "r");
faceTestLabelFile = fopen("facedata/facedatatestlabels", "r");

[faceImagesArray, validationLabels] = imageFileToMatrix(faceValidationFile, faceValidationLabelFile);
[faceImagesArray2, validationLabels2] = imageFileToMatrix(faceTestFile, faceTestLabelFile);

totalTrialAccuracies = zeros(10,1);
totalTrialStd = zeros(10,1);

for k=1:10
    
trialAccuracices = zeros(5,1);

    for t = 1 : 5
        results = zeros(1,301);

        for i = 1 : 301
               predictions = zeros(1,1);
               currentImage = ones(70*60 + 1, 1);
               currentImage(2:end) = reshape(faceImagesArray(:,:,i), [70*60,1]);
               z = currentImage .* totalTrialWeights(:,:,k);
               predictions = sum(z);
               normalizedPredictions = predictions > 0;
               results(i) = validationLabels(i) == normalizedPredictions;
        end
        trialAccuracices(t,1) = mean(results);
    end
    
    totalTrialStd(k,1) = std(trialAccuracices);
    totalTrialAccuracies(k,1) = mean(trialAccuracices);
end

[predicted, real] = singleTest(faceImagesArray2, weight, validationLabels2, 100)
%% Graphing Data
totalPercentages = 0.1:0.1:1;

x = totalPercentages;
y = totalTrialAccuracies;

% Plot 1
plot(x, y, 'b-', 'LineWidth', 2); 
xlabel('Percentages of Training Data Used');
ylabel('Average Accuracy (5 trials)');
title('Accuracy vs Percentages'); 
grid on; 

figure

x = totalPercentages;
y = totalTrialTimes;

% Plot 2
plot(x, y, 'b-', 'LineWidth', 2); 
xlabel('Percentages of Training Data Used');
ylabel('Average Time in s (5 trials)');
title('Time vs Percentages'); 
grid on; 

figure

x = totalPercentages;
y = totalTrialStd;

% Plot 3
plot(x, y, 'b-', 'LineWidth', 2); 
xlabel('Percentages of Training Data Used');
ylabel('Standard deviation (5 trials) ');
title('Std vs Percentages'); 
grid on; 
%10^-15
ylim([0 0.000000000000001]);

%% Functions 

%Function for loading training data 
function [faceImagesArray, labels] = loadTrain(percentage, totalImages)
    numberOfImages = round(percentage * totalImages);
    faceTrainingFile = fopen("facedata/facedatatrain", "r");
    faceTrainingLabelsFile = fopen("facedata/facedatatrainlabels", "r");
    labels = fscanf(faceTrainingLabelsFile, "%d");
    line = fgetl(faceTrainingFile)
    faceImagesArray = zeros(70,60,numberOfImages);
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
end

%Function for single testing
function [predicted, real] = singleTest(faceImagesArray, weight, validationLabels, image)
       predictions = zeros(1,1);
       currentImage = ones(70*60 + 1, 1);
       currentImage(2:end) = reshape(faceImagesArray(:,:,image), [70*60,1]);
       z = currentImage .* weight;
       predictions = sum(z);
       predicted = predictions > 0;
       real = validationLabels(image);
end

%Function for loading testing data
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