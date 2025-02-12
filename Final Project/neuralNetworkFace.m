%% load data 
[faceImagesArray, labels] = loadTrain(1, 451);

%% train neural network
%*A lambda = 0.01, 15 min, learning rate = 0.01, hiddenLayerNodes = 100,
%acc = 0.5490
%NEED LOSS FUNCTION FOR PERCEPTRON?
%ADD WAY TO TEST PERCENTAGE OF DATA
%GRAPH ALL THE ACCURACIES FOR DIFFERENT PERCENTAGES OF DATA USED 
%run multiple times for average on GRAPH  
%WRITE STUFF FOR REPORT GRAPH, EXPLAIN HOW IT WORK 
%THATS IT

%*100A, epochs = 300, lambda = 0.1, learningRate = 0.1, hiddenLayer = 20, trainacc = 0.9911,
%acc = 0.8970
%*100B, epochs = 395, lambda = 0.1, learningRate = 0.1, hiddenLayer = 10,
%trainacc = 0.9867, acc = 0.8804
%*100C, epochs = 370, lambda = 0.1, learningRate = 0.1, hiddenLayer = 20,
%trainacc = 0.9823, acc = 0.8704

lambda = 0.1;
learningRate = 0.1;
hiddenLayerNodes = 20;
outputLayerNodes = 1;
inputLayerNodes = 70*60;

totalTrialTimes = zeros(10,1);
totalTrialWeights1 = zeros(inputLayerNodes+1, hiddenLayerNodes, 10);
totalTrialWeights2 = zeros(hiddenLayerNodes + 1, outputLayerNodes, 10);

prevAccs = zeros(1, 10);

for k = 1:10
    disp("PERCENTAGE: " + 0.1*(k));
   [faceImagesArray, labels] = loadTrain((0.1*(k)), 451);
    trialWeights1 = zeros(inputLayerNodes+1,hiddenLayerNodes, 5);
    trialWeights2 = zeros(hiddenLayerNodes + 1, outputLayerNodes, 5);
    trialTimes = zeros(5,1);
    numberOfImages = round(0.1*(k)*451);

    for t = 1:5 
        disp("TRIAL: " + (t));
        tic;

        epochs = 300;
        weight1 = 2*rand(inputLayerNodes + 1, hiddenLayerNodes)-1;
        weight2 = 2*rand(hiddenLayerNodes + 1, outputLayerNodes)-1;
        totalCost = 9999;
        epochCounter = 0;

        for i = 1:epochs
           totalCost = 0;
           grad1 = zeros(inputLayerNodes + 1, hiddenLayerNodes);
           grad2 = zeros(hiddenLayerNodes + 1, outputLayerNodes);
           numCorrect = 0;
           for j = 1:numberOfImages
               %forward feed
               a0flip = ones(inputLayerNodes + 1, 1);
               a0flip(2:end) = reshape(faceImagesArray(:,:,j), [70*60,1]);
               a0flipRep = repmat(a0flip, [1, hiddenLayerNodes]);
               zs1 = weight1 .* a0flipRep;
               z1 = sum(zs1);

               a1 = (1 + exp(-z1)).^-1;
               a1flip = ones(hiddenLayerNodes + 1, 1);
               a1flip(2:end) = a1';
               a1flipRep = a1flip;
               zs2 = weight2 .* a1flipRep;
               z2 = sum(zs2);
               a2 = (1 + exp(-z2)).^-1;

               %back propagation
               currentLabel = zeros(1, 1);
               normalizedPredictions = a2 > 0.5;
               numCorrect = numCorrect + (labels(j) == normalizedPredictions);
               currentLabel = labels(j);
               d2 = a2 - currentLabel;
               d1 = (weight2*(d2')).*(a1flip.*(1-a1flip));
               grad1 = grad1 + (repmat(a0flip, [1, hiddenLayerNodes]) .* repmat(d1(2:end)', [inputLayerNodes+1, 1]));
               grad2 = grad2 + (repmat(a1flip, [1, outputLayerNodes]) .* repmat(d2, [hiddenLayerNodes+1, 1]));
               %update cost
               totalCost = totalCost + sum(currentLabel.*log(a2) + (1-currentLabel).*log(1-a2)); 

           end
           D1 = (1/451) * grad1;
           D1(2:end, :) = D1(2:end, :) + lambda*weight1(2:end, :);

           D2 = (1/451) * grad2;
           D2(2:end, :) = D2(2:end, :) + lambda*weight2(2:end, :);

           %change weights
           weight1 = weight1 - learningRate*D1;
           weight2 = weight2 - learningRate*D2;

           %cost function 
           totalCost = (-1/451)*totalCost;
           totalCost = totalCost + lambda/(2*451) * sum(weight1.^2,"all");
           totalCost = totalCost + lambda/(2*451) * sum(weight2.^2,"all");
           epochCounter = epochCounter + 1;
           disp(epochCounter);
           disp(totalCost);
           disp(learningRate);
           trainingAcc = numCorrect / 451

           % adaptive learning rate
           prevAccs(mod(epochCounter, length(prevAccs)) + 1) = trainingAcc;
           if trainingAcc < mean(prevAccs) + 0.01
              %learningRate = learningRate * 0.75
              prevAccs = zeros(1, 10);
           end
        end

        trialTimes(t,1) = toc;
        trialWeights1(:,:,t) = weight1;
        trialWeights2(:,:,t) = weight2;
    end
    mean_weight1 = mean(trialWeights1, 3);
    mean_weight2 = mean(trialWeights2, 3);

    totalTrialWeights1(:,:,k) = reshape(mean_weight1, [inputLayerNodes + 1, hiddenLayerNodes, 1]);
    totalTrialWeights2(:,:,k) = reshape(mean_weight2, [hiddenLayerNodes + 1, outputLayerNodes, 1]);

    writematrix(totalTrialWeights1(:,:,k), "NNWeightsFace_1_" + (0.1*k) + ".csv");
    writematrix(totalTrialWeights2(:,:,k), "NNWeightsFace_2_" + (0.1*k) + ".csv");

    totalTrialTimes(k,1) = mean(trialTimes);

end

%% test neural network face for demo
weight1 = csvread("NNWeightsFace_1_1.csv");
weight2 = csvread("NNWeightsFace_2_1.csv");
faceTestFile = fopen("facedata/facedatatest", "r");
faceTestLabelFile = fopen("facedata/facedatatestlabels", "r");

hiddenLayerNodes = 20;
outputLayerNodes = 1;
inputLayerNodes = 70*60;

[faceImagesArray2, validationLabels2] = imageFileToMatrix(faceTestFile, faceTestLabelFile);

[predicted, real] = singleTest(faceImagesArray2, validationLabels2, weight1, weight2, inputLayerNodes, hiddenLayerNodes, outputLayerNodes, 1)
%% Test Neural Network

%change this weight to best one before demo time to show them results 
weight1 = csvread("NNWeightsFace_1_1.csv");
weight2 = csvread("NNWeightsFace_2_1.csv");
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
               %forward feed
               a0flip = ones(inputLayerNodes + 1, 1);
               a0flip(2:end) = reshape(faceImagesArray(:,:,i), [70*60,1]);
               a0flipRep = repmat(a0flip, [1, hiddenLayerNodes]);
               zs1 = totalTrialWeights1(:,:,k).* a0flipRep;
               z1 = sum(zs1);
               a1 = (1 + exp(-z1)).^-1;
               a1flip = ones(hiddenLayerNodes + 1, 1);
               a1flip(2:end) = a1';
               a1flipRep = repmat(a1flip, [1, outputLayerNodes]);
               zs2 = totalTrialWeights2(:,:,k) .* a1flipRep;
               z2 = sum(zs2);
               a2 = (1 + exp(-z2)).^-1;

               normalizedPredictions = a2 > 0.5;
               results(i) = validationLabels(i) == normalizedPredictions;
        end
        trialAccuracices(t,1) = mean(results);

    end
     
    totalTrialStd(k,1) = std(trialAccuracices);
    totalTrialAccuracies(k,1) = mean(trialAccuracices);
end

[predicted, real] = singleTest(faceImagesArray2, validationLabels2, weight1, weight2, inputLayerNodes, hiddenLayerNodes, outputLayerNodes, 76)

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
axis([0.1 1 0 1]);

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
function [predicted, real] = singleTest(faceImagesArray, validationLabels, weight1, weight2, inputLayerNodes, hiddenLayerNodes, outputLayerNodes, image)
       %forward feed
       a0flip = ones(inputLayerNodes + 1, 1);
       a0flip(2:end) = reshape(faceImagesArray(:,:,image), [70*60,1]);
       a0flipRep = repmat(a0flip, [1, hiddenLayerNodes]);
       zs1 = weight1 .* a0flipRep;
       z1 = sum(zs1);
       a1 = (1 + exp(-z1)).^-1;
       a1flip = ones(hiddenLayerNodes + 1, 1);
       a1flip(2:end) = a1';
       a1flipRep = repmat(a1flip, [1, outputLayerNodes]);
       zs2 = weight2 .* a1flipRep;
       z2 = sum(zs2);
       a2 = (1 + exp(-z2)).^-1;
       
       predicted = a2 > 0.5;
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